export const AUTH_ERRORS = {
    NOT_EXIST_TOKEN: {
        errorCode: 200001,
        message: 'Not exist token',
    },
    INVALID_ACCESS_TOKEN: {
        errorCode: 200002,
        message: 'Invalid token',
    },
    INVALID_REFRESH_TOKEN: {
        errorCode: 200003,
        message: 'Invalid refresh token',
    },
    EXPIRED_TOKEN: {
        errorCode: 200004,
        message: 'Expired token',
    },
    INVALID_SIGNATURE: {
        errorCode: 200005,
        message: 'Invalid signature',
    },
    FAILED_AUTHENTICATE: {
        errorCode: 200006,
        message: 'Failed authenticate',
    },
    NOT_EXIST_JWT_TOKEN: {
        errorCode: 200007,
        message: 'Not exist jwt token',
    },
}

export const USERS_ERRORS = {
    NOT_EXIST_USER: {
        errorCode: 100001,
        status: 400,
        message: 'Can not find user',
    },
    USER_EMAIL_ALREADY_EXIST: {
        errorCode: 100002,
        status: 400,
        message: 'Already exist user email',
    },
    FAILED_CREATE_USER: {
        errorCode: 100003,
        status: 400,
        message: 'Failed create user',
    },
    FAILED_GET_USER_PROFILE: {
        errorCode: 100004,
        status: 400,
        message: 'Failed get user profile',
    },
    FAILED_UPDATE_USER: {
        errorCode: 100005,
        status: 400,
        message: 'Failed update user',
    },
}
