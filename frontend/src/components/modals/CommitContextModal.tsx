import { ICommitInfo, IStatus, RendererEvents } from "common_library";
import produce from "immer";
import React, { useEffect } from "react";
import { Modal } from "react-bootstrap";
import { shallowEqual, useDispatch } from "react-redux";
import { BranchUtils, EnumModals, UiUtils } from "../../lib";
import { BranchGraphUtils } from "../../lib/utils/BranchGraphUtils";
import { ActionModals } from "../../store";
import { useSelectorTyped } from "../../store/rootReducer";
import { SelectedRepoRightData } from "../selectedRepository/selectedRepoRight/SelectedRepoRightData";
import { InitialModalData, ModalData } from "./ModalData";

function CommitContextModalComponent(){
    const Data = ModalData.commitContextModal;
    const dispatch = useDispatch();
    const store = useSelectorTyped((state)=>({
        show:state.modal.openedModals.includes(EnumModals.COMMIT_CONTEXT),
        repo:state.savedData.recentRepositories.find(x=>x.isSelected),
    }),shallowEqual);

    useEffect(()=>{
        if(store.show){
            let elem = document.querySelector(".commitContext") as HTMLElement;
            console.log(Data)
            if(elem){
                elem.style.marginTop = Data.position.y+"px";
                elem.style.marginLeft = Data.position.x+"px";
            }
        }
    },[store.show])

    const hideModal=()=>{
        ModalData.commitContextModal = InitialModalData.commitContextModal;
        dispatch(ActionModals.hideModal(EnumModals.COMMIT_CONTEXT));
    }

    const checkOutCommit=()=>{
        window.ipcRenderer.send(RendererEvents.checkoutCommit().channel,ModalData.commitContextModal.selectedCommit,BranchUtils.repositoryDetails)
        hideModal();
    }
    const handleCreateNewBranchClick=()=>{
        ModalData.createBranchModal.sourceCommit = Data.selectedCommit;
        dispatch(ActionModals.hideModal(EnumModals.COMMIT_CONTEXT));
        dispatch(ActionModals.showModal(EnumModals.CREATE_BRANCH));
    }
    useEffect(()=>{
        const modalOpenEventListener = ()=>{
            dispatch(ActionModals.showModal(EnumModals.COMMIT_CONTEXT));
        }

        BranchGraphUtils.openContextModal = modalOpenEventListener;
        
        const listener = (_e:any,commit:ICommitInfo,status:IStatus)=>{
            //UiUtils.updateHeadCommit(commit);
            
            BranchGraphUtils.handleCheckout(commit,BranchUtils.repositoryDetails,status);            
            // SelectedRepoRightData.handleRepoDetailsUpdate(newRepoDetails);
            
        }
        window.ipcRenderer.on(RendererEvents.checkoutCommit().replyChannel,listener);
        
        return ()=>{
            UiUtils.removeIpcListeners([RendererEvents.checkoutCommit().replyChannel],[listener]);
        }

    },[])

    return (
        <Modal dialogClassName="commitContext"  size="sm" backdropClassName="bg-transparent" animation={false} show={store.show} onHide={()=> hideModal()}>
            <Modal.Body>
                <div className="container">
                    <div className="row g-0 border-bottom">
                        <div className="col-12 hover cur-default " onClick={checkOutCommit}>Checkout this commit</div> 
                    </div>
                    <div className="row g-0 border-bottom">
                        <div className="col-12 hover cur-default " onClick={handleCreateNewBranchClick}>Create branch from this commit</div>
                    </div>
                    <div>
                        <div className="col-12 hover cur-default ">Merge from this commit</div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}

export const CommitContextModal = React.memo(CommitContextModalComponent);