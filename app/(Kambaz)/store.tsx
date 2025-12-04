import { configureStore } from "@reduxjs/toolkit";
import modulesReducer from "./Courses/[cid]/Modules/reducer";
const store = configureStore({
reducer: {
modulesReducer,
},
});
export default store