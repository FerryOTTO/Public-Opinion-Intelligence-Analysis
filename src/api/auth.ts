export interface LoginRequest {
  username: string
  password: string
}

export interface LoginUserProfile {
  id: number
  username: string
  displayName: string
  role: string
  department: string
  lastLoginAt: string
  securityLevel: 'A' | 'B' | 'C'
}

export interface LoginResponse {
  success: boolean
  message: string
  token: string
  user: LoginUserProfile
  meta: {
    source: 'mysql'
    table: string
    latencyMs: number
    auditId: string
  }
}

const FAKE_LOGIN_ACCOUNTS: Record<string, { password: string; profile: Omit<LoginUserProfile, 'lastLoginAt'> }> = {
  admin: {
    password: '123456',
    profile: {
      id: 10001,
      username: 'admin',
      displayName: '系统管理员',
      role: 'super_admin',
      department: '网络舆情研判中心',
      securityLevel: 'A',
    },
  },
  operator: {
    password: '123456',
    profile: {
      id: 10027,
      username: 'operator',
      displayName: '值班分析员',
      role: 'duty_operator',
      department: '监测调度组',
      securityLevel: 'B',
    },
  },
}

function createAuditId(username: string) {
  const stamp = Date.now().toString(36)
  const userPart = username.slice(0, 3).padEnd(3, 'x')
  return `AUTH-${userPart.toUpperCase()}-${stamp}`
}

function createToken(username: string) {
  const payload = `${username}:${Date.now()}:mysql-session`
  return btoa(payload)
}

export async function loginWithDatabase(payload: LoginRequest): Promise<LoginResponse> {
  const startedAt = performance.now()
  const username = payload.username.trim().toLowerCase()
  const password = payload.password

  await new Promise((resolve) => window.setTimeout(resolve, 520))

  const account = FAKE_LOGIN_ACCOUNTS[username]
  if (!account || account.password !== password) {
    throw new Error('账号或密码错误，数据库未匹配到有效用户')
  }

  const endedAt = performance.now()

  return {
    success: true,
    message: '认证成功，已同步数据库权限信息',
    token: createToken(username),
    user: {
      ...account.profile,
      lastLoginAt: new Date().toISOString(),
    },
    meta: {
      source: 'mysql',
      table: 'sys_user_accounts',
      latencyMs: Math.round(endedAt - startedAt),
      auditId: createAuditId(username),
    },
  }
}
