import { ThunkAction } from "redux-thunk"
import { RootState } from "../store"
import { DataAction } from "../types"
import * as uiAction from "../types"

export function setThemeMount(): ThunkAction<
  void,
  RootState,
  undefined,
  DataAction
> {
  return async (dispatch) => {
    try {
      const darkMode =
        localStorage.getItem("darkMode") === "true" ? true : false
      localStorage.setItem("darkMode", `${darkMode}`)
      if (window !== undefined && darkMode !== null)
        return dispatch({
          type: uiAction.SET_DARKMODE,
          payload: darkMode,
        })
    } catch (error) {
      dispatch({
        type: uiAction.HANDLER_ERROR,
        payload: new Error(`Dark Mode Mount Error: ${error ? error : ""}`),
      })
    }
  }
}