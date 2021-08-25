import { ICommitInfo, IRepositoryDetails } from "common_library";
import React, { useRef } from "react"
import { useEffect } from "react";
import { shallowEqual } from "react-redux";
import { useMultiState } from "../../../lib";
import { useSelectorTyped } from "../../../store/rootReducer";
import { SingleBranch } from "./SingleBranch";

interface IBranchPanelProps{
    onCommitSelect:(commit:ICommitInfo)=>void;
    selectedCommit?:ICommitInfo;
    repoDetails:IRepositoryDetails;
}

interface IState{
    scale:number;
    paddingTop:number;
    paddingLeft:number;
}

function BranchPanelComponent(props:IBranchPanelProps){
    const panelHeight = 400;
    const store = useSelectorTyped(state=>({
        zoom:state.ui.versions.branchPanelZoom,
    }),shallowEqual);
    useEffect(()=>{
        if(props.repoDetails?.headCommit) {
            let elmnt = document.getElementById(props.repoDetails.headCommit.hash);
            if(elmnt) elmnt.scrollIntoView();            
        }
    },[props.repoDetails?.headCommit])

    useEffect(()=>{
        setState({scale:1+ (store.zoom/10)});        
    },[store.zoom])

    const [state,setState]=useMultiState<IState>({scale:1,paddingLeft:0,paddingTop:0});
    
    const getSVGHeight = ()=>{
        if(props.repoDetails.branchPanelHeight < panelHeight) return panelHeight;
        return props.repoDetails.branchPanelHeight;
    }    

    const scrollPosition = useRef({scrollTop:0,scrollLeft:Number.MAX_SAFE_INTEGER});
    const adjustPadding = ()=>{
        if( state.scale <= 1) return;
        const svgHeight = getSVGHeight();
        const hiddenHeightSpace = svgHeight * state.scale - panelHeight;
        let paddingTop = 0;
        let paddingLeft = 0;
        if(scrollPosition.current.scrollTop < hiddenHeightSpace / 2){
            paddingTop = Math.ceil(hiddenHeightSpace/2);
        }

        const svgWidth = props.repoDetails.branchPanelWidth;
        const hiddenWidthSpace = svgWidth * state.scale - svgWidth;        
        if(scrollPosition.current.scrollLeft < hiddenWidthSpace / 2){
            paddingLeft = Math.ceil(hiddenWidthSpace/2);            
        }

        setState({paddingLeft,paddingTop});
    }
    const timer = useRef<NodeJS.Timeout|null>();

    const setPaddingAdjustTimeout = ()=>{
        timer.current = setTimeout(()=>{
            adjustPadding();
            timer.current = null!;
        },100);
    }

    useEffect(()=>{
        if(!timer.current) setPaddingAdjustTimeout();
    },[state.scale])

    const handleScroll =  (e: React.UIEvent<HTMLDivElement, UIEvent>)=>{
        const { scrollTop,scrollLeft } =  e.target as HTMLDivElement;
        scrollPosition.current.scrollLeft = scrollLeft;
        scrollPosition.current.scrollTop = scrollTop;        
        if(!timer.current) setPaddingAdjustTimeout();                
    }
    

    if(!props.repoDetails) return <span className="d-flex justify-content-center w-100">Loading...</span>;
    console.log(props.repoDetails);
    return <div id="branchPanel" className="w-100 overflow-scroll" onScroll={handleScroll}>
            <svg width={props.repoDetails.branchPanelWidth} height={getSVGHeight()} style={{transform:`scale(${state.scale})`, paddingTop:`${state.paddingTop}px`,paddingLeft:`${state.paddingLeft}px`} }>
                <g>
                    {
                        props.repoDetails.mergedLines.map(line=>(
                            <line key={`${line.srcX}-${line.srcY}-${line.endX}-${line.endY}`} x1={line.srcX} y1={line.srcY} x2={line.endX} y2={line.endY} stroke="green" strokeWidth={1} />
                        ))
                    }
                    {
                        props.repoDetails.resolvedBranches.map(branch=>(
                            <SingleBranch key={branch._id} branchDetails ={branch} onCommitSelect={props.onCommitSelect} selectedCommit={props.selectedCommit} />
                        ))
                    }                                        
                </g>
            </svg>
    </div>
}

export const BranchPanel = React.memo(BranchPanelComponent);