export const USERS_ERRORS = {
    NOT_EXIST_USER: {
        errorCode: 100001,
        status: 400,
        message: '해당 유저를 찾을 수 없습니다.',
    },
    USER_EMAIL_ALREADY_EXIST: {
        errorCode: 100002,
        status: 400,
        message: '이미 존재하는 Email입니다.',
    },
    FAILED_CREATE_USER: {
        errorCode: 100003,
        status: 400,
        message: '유저 생성에 실패했습니다.',
    },
    FAILED_GET_USER_PROFILE: {
        errorCode: 100004,
        status: 400,
        message: '유저 프로필 조회에 실패했습니다.',
    },
}
