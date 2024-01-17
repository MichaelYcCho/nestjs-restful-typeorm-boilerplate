export const USERS_ERRORS = {
    NOT_EXIST_USER: {
        errorCode: 100001,
        status: 400,
        message: 'can not find user',
    },
    USER_EMAIL_ALREADY_EXIST: {
        errorCode: 100002,
        status: 400,
        message: 'already exist user email',
    },
    FAILED_CREATE_USER: {
        errorCode: 100003,
        status: 400,
        message: 'failed create user',
    },
    FAILED_GET_USER_PROFILE: {
        errorCode: 100004,
        status: 400,
        message: 'failed get user profile',
    },
}
