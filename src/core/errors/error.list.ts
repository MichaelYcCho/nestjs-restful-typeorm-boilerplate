export const AUTH_ERRORS = {
    NOT_EXIST_JWT_STORAGE: {
        errorCode: 'AUTH_00001',
        message: 'Not exist jwt storage',
    },
    INVALID_ACCESS_TOKEN: {
        errorCode: 'AUTH_00002',
        message: 'Invalid token',
    },
    INVALID_REFRESH_TOKEN: {
        errorCode: 'AUTH_00003',
        message: 'Invalid refresh token',
    },
    EXPIRED_TOKEN: {
        errorCode: 'AUTH_00004',
        message: 'Expired token',
    },
    INVALID_SIGNATURE: {
        errorCode: 'AUTH_00005',
        message: 'Invalid signature',
    },
    FAILED_AUTHENTICATE: {
        errorCode: 'AUTH_00006',
        message: 'Failed authenticate',
    },
    MISSING_AUTHORIZATION_HEADER: {
        errorCode: 'AUTH_00007',
        message: 'Authorization header is missing. Please provide Bearer token.',
    },
    MISSING_JWT_TOKEN: {
        errorCode: 'AUTH_00008',
        message: 'JWT token is missing. Please provide valid Bearer token.',
    },
}

export const USERS_ERRORS = {
    NOT_EXIST_USER: {
        errorCode: 'USER_00001',
        status: 400,
        message: 'Can not find user',
    },
    USER_EMAIL_ALREADY_EXIST: {
        errorCode: 'USER_00002',
        status: 400,
        message: 'Already exist user email',
    },
    FAILED_CREATE_USER: {
        errorCode: 'USER_00003',
        status: 400,
        message: 'Failed create user',
    },
    FAILED_GET_USER_PROFILE: {
        errorCode: 'USER_00004',
        status: 400,
        message: 'Failed get user profile',
    },
    FAILED_UPDATE_USER: {
        errorCode: 'USER_00005',
        status: 400,
        message: 'Failed update user',
    },
    FAILED_DELETE_USER: {
        errorCode: 'USER_00006',
        status: 400,
        message: 'Failed delete user',
    },
}
