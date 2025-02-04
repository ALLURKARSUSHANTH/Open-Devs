export const SET_USER_PROFILE = 'SET_USER_PROFILE';
export const CLEAR_USER_PROFILE = 'CLEAR_USER_PROFILE';

export const setUserProfile = (profile) => ({
  type: SET_USER_PROFILE,
  payload: profile,
});

export const clearUserProfile = () => ({
  type: CLEAR_USER_PROFILE,
});
