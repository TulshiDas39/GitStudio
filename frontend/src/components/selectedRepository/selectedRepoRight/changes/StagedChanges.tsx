import { IFile, IStatus, RendererEvents, RepositoryInfo } from "common_library";
import React, { useEffect } from "react";
import { Fragment } from "react";
import { FaAngleDown, FaAngleRight, FaMinus } from "react-icons/fa";
import { UiUtils, useMultiState } from "../../../../lib";


interface IStagedChangesProps{
    stagedChanges:IFile[];
    repoInfoInfo?:RepositoryInfo;
    onStatusChange:(status:IStatus)=>void;

}

interface IState{
    isStagedChangesExpanded:boolean;
    hoveredFile?:IFile;
    isHeadHover:boolean;
}

function StagedChangesComponent(props:IStagedChangesProps){
    const [state,setState] = useMultiState<IState>({isStagedChangesExpanded:true,isHeadHover:false});
    const handleStageCollapse = () => {
        setState({ isStagedChangesExpanded: !state.isStagedChangesExpanded });
    }

    useEffect(()=>{
        window.ipcRenderer.on(RendererEvents.unStageItem().replyChannel,(_,res:IStatus)=>{
            console.log('unstaged',res);
            props.onStatusChange(res);
        });
        return ()=>{
            UiUtils.removeIpcListeners([RendererEvents.unStageItem().replyChannel]);
        }
    },[]);

    const handleUnstageItem = (item:IFile)=>{
        window.ipcRenderer.send(RendererEvents.unStageItem().channel,[item.path],props.repoInfoInfo)
    }

    const unStageAll=()=>{
        if(!props.stagedChanges?.length) return;
        window.ipcRenderer.send(RendererEvents.unStageItem().channel,props.stagedChanges.map(x=>x.path),props.repoInfoInfo)
    }

    return <Fragment>
    <div className="d-flex hover" onMouseEnter={_=> setState({isHeadHover:true})} onMouseLeave={_=> setState({isHeadHover:false})}>
        <div className="d-flex flex-grow-1" onClick={handleStageCollapse}>
            <span>{state.isStagedChangesExpanded ? <FaAngleDown /> : <FaAngleRight />} </span>
            <span>Staged Changes</span>            
        </div>        
        {state.isHeadHover && <div className="d-flex">            
            <span className="hover" title="UnStage all" onClick={_=> unStageAll()}><FaMinus /></span>
        </div>}
        
    </div>
    {state.isStagedChangesExpanded && 
    <div className="container ps-2" onMouseLeave={_=> setState({hoveredFile:undefined})}>
        {props.stagedChanges.map(f=>(
            <div key={f.path} className="row g-0 align-items-center flex-nowrap hover w-100" 
                title={f.path} onMouseEnter={()=> setState({hoveredFile:f})}>
                <div className="col-auto overflow-hidden">
                    <span className="pe-1 flex-shrink-0">{f.fileName}</span>
                    <span className="small text-secondary">{f.path}</span>
                </div>
                
                {state.hoveredFile?.path === f.path && <div className="col bg-white ps-3 text-end" style={{ right: 0 }}>
                    <span className="hover" title="Unstage" onClick={_=> handleUnstageItem(f)}><FaMinus /></span>                                    
                </div>}
            </div>
        ))}                        
    </div>
    }
</Fragment>
}

export const StagedChanges = React.memo(StagedChangesComponent);