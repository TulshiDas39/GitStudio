import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RendererEvents, RepositoryInfo } from "common_library";

interface ISavedData{
    recentRepositories:RepositoryInfo[];
}

const initialState:ISavedData={
    recentRepositories:[],
}

const SavedDataSlice = createSlice({
    initialState:initialState,
    name:"SavedData",
    reducers:{
        setRecentRepositories(state,action:PayloadAction<RepositoryInfo[]>){
            state.recentRepositories = action.payload;
        },
        setSelectedRepository(state,action:PayloadAction<RepositoryInfo>){
            const updatedList:RepositoryInfo[]=[];            
            const existingSelected = state.recentRepositories.find(x=>x.isSelected);
            if(existingSelected) {
                existingSelected.isSelected = false;
                updatedList.push(existingSelected);
            }
            let newSelected = state.recentRepositories.find(x=>x.path === action.payload.path);
            if(!newSelected) {
                newSelected = action.payload;
                state.recentRepositories.push(action.payload);
            }
            newSelected.isSelected = true;
            newSelected.lastOpenedAt = new Date().toISOString();
            updatedList.push(action.payload);

            window.ipcRenderer.send(RendererEvents.updateRepositories,updatedList);
        },
        deSelectRepo(state){
            const selectedRepo = state.recentRepositories.find(x=>x.isSelected);
            if(selectedRepo) selectedRepo.isSelected = false;
        }

    }
});

export const ActionSavedData = SavedDataSlice.actions;
export const ReducerSavedData = SavedDataSlice.reducer;