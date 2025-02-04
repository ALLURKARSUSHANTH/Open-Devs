import { SET_USER_PROFILE, CLEAR_USER_PROFILE } from '../actions/authActions';

const initialState = {
  profile: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER_PROFILE:
      return { ...state, profile: action.payload };
    case CLEAR_USER_PROFILE:
      return { ...state, profile: null };
    default:
      return state;
  }
};

export default authReducer;
