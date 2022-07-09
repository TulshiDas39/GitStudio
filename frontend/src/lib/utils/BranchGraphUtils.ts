import { IRepositoryDetails } from "common_library";
import ReactDOM from "react-dom";
import { IViewBox } from "../interfaces";
import { BranchUtils } from "./BranchUtils";
import * as ReactDOMServer from 'react-dom/server';
import { BranchPanel2 } from "../../components/selectedRepository/selectedRepoRight/branches/BranchPanel2";

interface IState{
    scrollTop:number;
    scrollLeft:number;
    horizontalScrollRatio:number;
    verticalScrollRatio:number;
    viewBox:IViewBox;
    notScrolledHorizontallyYet:boolean;
    notScrolledVerticallyYet:boolean;
    verticalScrollTop:number;
    horizontalScrollLeft:number;    
}

export class BranchGraphUtils{
    static branchPanelContainerId = "branchPanelContainer";
    static branchPanelRootElement:HTMLDivElement= null!;
    static branchPanelHtml:string='';
    static panelWidth = -1;
    static panelHeight = 400;
    static zoom = 0;
    static get horizontalScrollContainerWidth(){
        return this.panelWidth+10;
    }
   

    static state:IState={
        scrollTop:0,
        horizontalScrollRatio:0,
        verticalScrollRatio:0,
        viewBox: {x:0,y:0,width:0,height:0},
        notScrolledHorizontallyYet:true,
        notScrolledVerticallyYet:true,
        verticalScrollTop:0,
        horizontalScrollLeft:0,
    } as IState;

    static dataRef ={
        initialHorizontalScrollLeft:0,
        initialVerticalScrollTop:0,
        isMounted:false,
        zoom:this.zoom,
        initialViewbox:this.state.viewBox,
    }

    static setInitialState(){
        this.state ={
            scrollLeft:BranchUtils.repositoryDetails.branchPanelWidth,
            scrollTop:0,
            horizontalScrollRatio:0,
            verticalScrollRatio:0,
            viewBox: {x:0,y:0,width:this.panelWidth,height:this.panelHeight},
            notScrolledHorizontallyYet:true,
            notScrolledVerticallyYet:true,
            verticalScrollTop:0,
            horizontalScrollLeft:0,
        }
    }

    static createBranchPanel(){
        if(!BranchUtils.repositoryDetails) return;
        if(this.panelWidth ===  -1) return;

        // this.branchPanelRootElement = document.createElement('div');
        // this.branchPanelRootElement.id = "branchPanel";
        // this.branchPanelRootElement.classList.add("w-100");
        // this.branchPanelRootElement.style.overflow="hidden";

        // let svgContainer = document.createElement('div');
        // svgContainer.classList.add("d-flex","align-items-stretch");
        // svgContainer.style.width = `${this.horizontalScrollContainerWidth}px`;
        // const svg = document.createElement('svg');
        // svg.setAttribute('width',`${this.panelWidth}px`);
        // svg.setAttribute('height',`${this.panelHeight}px`)
        // // svg.style.height = `${this.panelHeight}px`;
        // const viewBox:IViewBox =  {x:0,y:0,width:this.panelWidth,height:this.panelHeight};
        // svg.setAttribute('viewBox',`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`)
        // svg.style.transform = `scale(1)`;
        // svgContainer.appendChild(svg);



        // this.branchPanelRootElement.appendChild(svgContainer);
        
        this.state.viewBox.width = this.panelWidth;
        this.state.viewBox.height = this.panelHeight;


        this.setScrollInfos();

        const horizontalScrollWidth = this.getHorizontalScrollWidth();
        const verticalScrollHeighth = this.getVerticalScrollHeight();

        const html = ReactDOMServer.renderToStaticMarkup(BranchPanel2({
            containerWidth:this.panelWidth,
            panelHeight:this.panelHeight,
            repoDetails:BranchUtils.repositoryDetails,
            viewBox:this.state.viewBox,
            horizontalScrollWidth:horizontalScrollWidth,
            verticalScrollHeight:verticalScrollHeighth,
        }))
        this.branchPanelHtml = html;

    }

    static insertNewBranchGraph(){
        
        // if(!this.branchPanelRootElement) return;
        const container = document.querySelector(`#${this.branchPanelContainerId}`);
        if(!container) return;
        // container.innerHTML = '';
        // container.appendChild(this.branchPanelRootElement);
        // container.innerHTML = this.branchPanelHtml;
        container.innerHTML = this.branchPanelHtml;
    }

    static getVerticalScrollHeight(){        
        let totalHeight = BranchUtils.repositoryDetails.branchPanelHeight;
        if(totalHeight < this.panelHeight) totalHeight = this.panelHeight;
        const height = this.state.viewBox.height / totalHeight;        
        return height*this.panelHeight;
    }

    static  getHorizontalScrollWidth(){
        let totalWidth = BranchUtils.repositoryDetails.branchPanelWidth;
        if(totalWidth < this.panelWidth) totalWidth = this.panelWidth;
        const widthRatio = this.state.viewBox.width / totalWidth;
        const horizontalScrollWidth = widthRatio*this.panelWidth;
        return horizontalScrollWidth;
    }

    static setScrollInfos () {        
        if(BranchUtils.repositoryDetails?.headCommit) {
            let elmnt = document.getElementById(BranchUtils.repositoryDetails.headCommit.hash);
            if(elmnt) elmnt.scrollIntoView();            
        }
        else return;
        let totalWidth = BranchUtils.repositoryDetails.branchPanelWidth;
        let totalHeight = BranchUtils.repositoryDetails.branchPanelHeight;
        if(totalHeight < this.panelHeight) totalHeight = this.panelHeight;        
        if(totalWidth < this.panelWidth) totalHeight = this.panelWidth;
        const horizontalRatio = BranchUtils.repositoryDetails.headCommit.x/totalWidth;
        const verticalRatio = BranchUtils.repositoryDetails.headCommit.ownerBranch.y/totalHeight;
        const verticalScrollHeight = this.getVerticalScrollHeight();
        let verticalScrollTop = (this.panelHeight-verticalScrollHeight)*verticalRatio;   
        const horizontalScrollWidth = this.getHorizontalScrollWidth();     
        let horizontalScrollLeft = (this.horizontalScrollContainerWidth-horizontalScrollWidth)*horizontalRatio;        
        this.dataRef.initialVerticalScrollTop = verticalScrollTop;
        this.dataRef.initialHorizontalScrollLeft = horizontalScrollLeft;

        const x = totalWidth *horizontalRatio;
        let viewBoxX = 0;
        if(totalWidth > this.panelWidth) viewBoxX = x- (this.panelWidth/2);

        const y = totalHeight *verticalRatio;
        let viewBoxY = 0;
        if(totalHeight > this.panelHeight) viewBoxY = y - (this.panelHeight/2);        
        
        this.state.horizontalScrollRatio=horizontalRatio;
        this.state.verticalScrollRatio=verticalRatio;
        this.state.verticalScrollTop=verticalScrollTop;
        this.state.horizontalScrollLeft=horizontalScrollLeft;
        this.state.viewBox={
            ...this.state.viewBox,
            x:viewBoxX,
            y:viewBoxY,                
        }        

    }
}