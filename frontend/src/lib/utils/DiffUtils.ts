import { ILineHighlight } from "../editor";
import { ILine } from "../interfaces";
import { DeltaStatic,DeltaOperation ,Quill} from "quill";
import { EnumCustomBlots } from "../enums";
export type TDiffLineType = "unchanged"|"added"|"removed";

export class DiffUtils{

    static tabSize = 4;

    static getEditorWidth (lines:string[]){
        const width = Math.max(...lines.map(l=>{
            let length = l.length;
            if(l.includes('\t')) {
                let tabCount = l.match(/\t/g)?.length ?? 0;
                length += tabCount * (this.tabSize) - tabCount;
            }
            return length;
        }));
        return width+20;
    }

    static GetUiLines(diff:string,textLines:string[]){
                
        const diffLines = diff.split('\n');
        // const sections:number[][]=[];
        console.log("text lines",textLines);
        let startIndexesOfSections = 0;
        let lineNumberOfCurrentChange= 0;
        let lineNumberOfPreviousChange= 0;
        
        const getFileLineNumber=(line:string)=>{
            const diffRange = line.split('@@')[1].trim();
            const previousRange = diffRange.split('+')[0].trim();
            const currentRange = diffRange.split('+')[1].trim();
            //split('+')[0].split(',')[0].split('-')[1]            
            const lineNumberOfPreviousChange = Number(previousRange.split(',')[0].substring(1))
            const lineNumberOfCurrentChange = Number(currentRange.split(',')[0])
            return {
                lineNumberOfPreviousChange,
                lineNumberOfCurrentChange,
            }
        }

        const setFileLineNumber=(line:string)=>{
            const lineNumber = getFileLineNumber(line);            
            lineNumberOfPreviousChange = lineNumber.lineNumberOfPreviousChange;
            lineNumberOfCurrentChange = lineNumber.lineNumberOfCurrentChange;

        }

        for(let i=0;i<diffLines.length; i++){
            const line = diffLines[i];
            if(line.startsWith("@@")) {
                startIndexesOfSections=i+1;
                setFileLineNumber(line);
                break;
            }
        }

        let currentLines:ILine[]=[];
        let previousLines:ILine[]=[];

        for(let i=0;i<lineNumberOfCurrentChange-1;i++){
            const previousLine:ILine={
                text:textLines[i],
                textHightlightIndex:[],
            }

            const currentLine:ILine={
                text:textLines[i],
                textHightlightIndex:[],
            }
            currentLines.push(currentLine);
            previousLines.push(previousLine);            
        }

        // let trackingIndex = 0;
        let currentCharTrackingIndex = 0;
        let previousCharTrackingIndex = 0;
        let currentLine:ILine ={
            textHightlightIndex:[],
        }
        //currentLines.push(currentLine);

        let previousLine:ILine ={
            textHightlightIndex:[],
        }
        //previousLines.push(previousLine);

        let currentChangeType:TDiffLineType = "unchanged";

        for(let i=startIndexesOfSections;i<diffLines.length;i++){
            const diffLine = diffLines[i];
            
            if(diffLine.startsWith("@@")){
                const nextStartingFileLineNumber = getFileLineNumber(diffLine);
                for(let i = lineNumberOfCurrentChange-1; i < nextStartingFileLineNumber.lineNumberOfCurrentChange -1;i++){                    
                    currentLines.push({
                        text:textLines[i],
                        textHightlightIndex:[],
                    });
                    previousLines.push({
                        text:textLines[i],
                        textHightlightIndex:[],
                    });                    
                }
                currentLine ={           
                    textHightlightIndex:[],
                }
                previousLine ={                        
                    textHightlightIndex:[],
                }

                currentLines.push(currentLine);
                previousLines.push(previousLine);

                lineNumberOfCurrentChange = nextStartingFileLineNumber.lineNumberOfCurrentChange;
                lineNumberOfPreviousChange = nextStartingFileLineNumber.lineNumberOfPreviousChange;
            }            

            else if(diffLine.startsWith(" ")){
                currentChangeType = "unchanged";
                //if(currentLine.text === undefined) currentLine.text = textLines[lineNumberOfFile-1];                                
                if(previousLine.text === undefined){                                                                                      
                    // while(previousLines.length < currentLines.length){
                    //     previousLines.push(previousLine);
                    //     previousLine = {
                    //         textHightlightIndex:[],
                    //     }                        
                    // }                     
                    previousLine.text = "";
                }
                if(currentLine.text === undefined) {
                    // while(previousLines.length > currentLines.length){
                    //     currentLines.push(currentLine);
                    //     currentLine = {
                    //         textHightlightIndex:[],
                    //     }                        
                    // }
                    currentLine.text = "";
                }
                previousLine.text += diffLine.substring(1);
                currentLine.text += diffLine.substring(1);
                currentCharTrackingIndex += diffLine.length-1;
                previousCharTrackingIndex += diffLine.length-1;                
            }
            else if(diffLine.startsWith("+")){
                currentChangeType = "added";
                if(currentLine.text === undefined)currentLine.text = "";                
                currentLine.text! += diffLine.substring(1);
                currentLine.textHightlightIndex.push({fromIndex:currentCharTrackingIndex,count:diffLine.length-1});
                currentCharTrackingIndex += diffLine.length-1;
            }
            else if(diffLine.startsWith("-")){
                currentChangeType = "removed";
                if(!previousLine.text) previousLine.text = "";
                previousLine.text += diffLine.substring(1);                
                previousLine.textHightlightIndex.push({fromIndex:previousCharTrackingIndex,count:diffLine.length-1});
                previousCharTrackingIndex += diffLine.length-1;
            }
            else if(diffLine.startsWith("~")){
        
                if(diffLines[i-1].startsWith("~")){
                    let isAdded = true;
                    let count = 1;
                    while(diffLines[i+count].startsWith("~"))
                        count++;                                                
                    if(textLines.slice(lineNumberOfCurrentChange-1,lineNumberOfCurrentChange-1+count).some(text=> text !== ""))
                        isAdded=false;

                    if(isAdded){
                        for(let x=0;x < count; x++){
                            currentLine.text = "";
                            currentLine.hightLightBackground = true;
                            
                            currentLines.push(currentLine);
                            previousLines.push(previousLine);                            
                            
                            currentLine ={
                                textHightlightIndex:[],
                            }
                            previousLine ={
                                textHightlightIndex:[],
                            }
                            
                        }
                        lineNumberOfCurrentChange += count;
                        currentCharTrackingIndex = 0;
                    }
                    else{
                        for(let x=0;x < count; x++){
                            previousLine.text = "";
                            previousLine.hightLightBackground = true;                            
                            
                            currentLines.push(currentLine);
                            previousLines.push(previousLine);
                            
                            currentLine = {
                                textHightlightIndex:[],
                            }
                            previousLine = {
                                textHightlightIndex:[],
                            }                                
                            
                        }
                        lineNumberOfPreviousChange += count;                            
                        previousCharTrackingIndex = 0;
                    }

                    i = i + count - 1;                    
                }
                else if(diffLines[i-1].startsWith("+")){                    
                    currentLine.hightLightBackground = true;
                    if(previousLine.text !== undefined) previousLine.hightLightBackground = true;                    
                    currentLines.push(currentLine);

                    currentLine = {
                        textHightlightIndex:[]
                    }
                    lineNumberOfCurrentChange++;
                    currentCharTrackingIndex = 0;
                }
                else if(diffLines[i-1].startsWith("-")){
                    previousLine.hightLightBackground = true;
                    if(currentLine.text !== undefined) currentLine.hightLightBackground = true;
                    previousLines.push(previousLine);
                    previousLine = {
                        textHightlightIndex:[],
                    }
                    lineNumberOfPreviousChange++;
                    previousCharTrackingIndex = 0;
                }

                else if(diffLines[i-1].startsWith(" ")){
                    if(previousLine.textHightlightIndex.length || currentLine.textHightlightIndex.length){
                        currentLine.hightLightBackground = true;
                        previousLine.hightLightBackground = true;
                    }
                    currentLines.push(currentLine);
                    previousLines.push(previousLine);

                    currentLine = {
                        textHightlightIndex:[]
                    }
                    previousLine = {
                        textHightlightIndex:[],
                    }

                    while(previousLines.length > currentLines.length){
                        currentLines.push(currentLine);
                        currentLine = {
                            textHightlightIndex:[],
                        }                        
                    }

                    while(previousLines.length > currentLines.length){
                        currentLines.push(currentLine);
                        currentLine = {
                            textHightlightIndex:[],
                        }                        
                    }                    
                    
                    lineNumberOfCurrentChange++;
                    lineNumberOfPreviousChange++;
                    previousCharTrackingIndex = 0;
                    currentCharTrackingIndex = 0;
                }

                // else{
                //     if(currentLine.textHightlightIndex.length){
                //         currentLine.hightLightBackground = true;
                //         if(previousLine.text !== undefined) previousLine.hightLightBackground = true;
                //     }
                //     else if(previousLine.textHightlightIndex.length){
                //         previousLine.hightLightBackground = true;
                //         if(currentLine.text !== undefined) currentLine.hightLightBackground = true;
                //     }
                //     if(currentLine.text !== undefined) lineNumberOfCurrentChange++;
                // }

                // if(currentChangeType !== "removed"){                    
                    
                //     if(currentChangeType === "added"){
                //         currentLine.hightLightBackground = true;
                //         if(previousLine.text !== undefined)
                //             previousLine.hightLightBackground = true;
                        
                //         lineNumberOfFile++;    
                //     }
                //     else if(diffLines[i-1].startsWith("~")){
                //         let isAdded = true;
                //         let count = 1;
                //         while(diffLines[i+count].startsWith("~"))
                //             count++;                                                
                //         if(textLines.slice(lineNumberOfFile-1,lineNumberOfFile-1+count).some(text=> text !== ""))
                //             isAdded=false;

                //         if(isAdded){
                //             for(let x=i;x < i+count; x++){
                //                 currentLine.text = "";
                //                 currentLine.hightLightBackground = true;
                //                 currentLines.push(currentLine);
                //                 previousLines.push(previousLine);
                                
                //                 currentLine ={
                //                     textHightlightIndex:[],
                //                 }
                //                 previousLine ={
                //                     textHightlightIndex:[],
                //                 }
                //             }

                //         }
                //         else{
                //             for(let x=i;x < i+count; x++){
                //                 previousLine.text = "";
                //                 previousLine.hightLightBackground = true;
                //                 currentLines.push(currentLine);
                //                 previousLines.push(previousLine);
                                
                //                 currentLine = {
                //                     textHightlightIndex:[],
                //                 }
                //                 previousLine = {
                //                     textHightlightIndex:[],
                //                 }                                
                //             }                            
                //         }

                //         currentLines.pop();
                //         previousLines.pop();

                //         i = i + count - 1;
                //         if(isAdded)
                //             lineNumberOfFile += count;
                //     }
                //     else
                //         lineNumberOfFile++;
                    
                // } 
                // else {                   
                //     previousLine.hightLightBackground = true;
                //     if(currentLine.text !== undefined) currentLine.hightLightBackground = true;                   
                // }                                   
            }
        }

        while(lineNumberOfCurrentChange < textLines.length){
            let lineConfig:ILine = {
                textHightlightIndex:[],
                text:textLines[lineNumberOfCurrentChange],
            };
            currentLines.push(lineConfig);
            previousLines.push(lineConfig);
            lineNumberOfCurrentChange++;
            lineNumberOfPreviousChange++;
        }
        
        const previousLineMaxWidth = this.getEditorWidth(previousLines.map(x=>x.text?x.text:""));
        const currentLineMaxWidth =  this.getEditorWidth(currentLines.map(x=>x.text?x.text:""));
        return {
            currentLines,
            previousLines,
            //previousLineMaxWidth,currentLineMaxWidth
        };
    
    }

    static getDeltaFromLineConfig(lines:ILine[],color:ILineHighlight,maxLineWidth:number){        
        const operations:DeltaOperation[]=[];        
        const delta = {
            ops:operations,
        } as DeltaStatic;
        
        if(!lines.length) 
            return delta;
        
        let createOperation=(line:ILine)=>{    
            if(line.transparent) operations.push({
                insert: `${Array(maxLineWidth).fill(" ").join("")}`,
                attributes:{background:"black"}
            })
            else if(line.text != undefined){                
                const heightLightCount = line.textHightlightIndex.length;
                if(!!heightLightCount){
                    let insertedUptoIndex = -1;                    
                    line.textHightlightIndex.forEach((range)=>{                        
                        if(range.fromIndex > insertedUptoIndex+1 ){                            
                            operations.push({
                                insert:line.text!.substring(insertedUptoIndex+1,range.fromIndex),
                                attributes:{
                                    background:color.background,
                                }
                            });                            
                        }
                        operations.push({
                            insert:line.text!.substring(range.fromIndex, range.fromIndex+range.count),
                            attributes:{
                                background:color.forground,
                            }
                        })                        
    
                        insertedUptoIndex = range.fromIndex+range.count-1;
                    })
                    if(insertedUptoIndex < line.text.length-1){
                        operations.push({
                            insert: line.text.substring(insertedUptoIndex+1),
                            attributes:{
                                background:color.background,
                            } 
                        })
                    }                    
                } 
                else{
                    operations.push({
                        insert:line.text,                        
                    })
                }                
            }
        }

        createOperation(lines[0]);

        lines.slice(1).forEach((line)=>{
            operations.push({
                insert:`\n`
            })
            createOperation(line);
        })        
        
        return delta;        
    }

    static getDeltaForLineNumber(lines:ILine[]){
        const operations:DeltaOperation[]=[];

        let lineNumber = 1;
        for(let i=0;i<lines.length;i++){
            let line = lines[i];
            if(line.text !== undefined){
                operations.push({insert:`${lineNumber}\n`});
                lineNumber++;
            }
            else
                operations.push({insert:"\n"});
        }

        const delta = {
            ops:operations,
        } as DeltaStatic;
        
        return delta;
    }

    static formatLinesBackground(quill:Quill,lines:ILine[],format:EnumCustomBlots){                
        let index = 0;
        for(let i = 0;i<lines.length;i++){
            let line = lines[i];            
            if(line.hightLightBackground)
                quill?.formatLine(index,line?.text?.length??0,format,true,"silent");

            else if(line.text === undefined){
                if(format === EnumCustomBlots.CurrentBackground){
                    debugger;
                }
                quill?.formatLine(index,0,EnumCustomBlots.TransparentBackground,true,"silent");
            }
            if(line.text !== undefined){
                index = index + line.text.length+1 
            }
            else
            index += 1;
        }              
    }

    static getCoparableLineNumbers(currentLines:ILine[]){
        const lineNumbers:number[] = [];
        let lastComparableLine = 0;
        currentLines.forEach((l,index)=>{
            if(l.hightLightBackground){                
                if(lastComparableLine != index)
                    lineNumbers.push(index+1);
                lastComparableLine = index+1    
            }
            else if(l.text === undefined){
                if(lastComparableLine != index)
                    lineNumbers.push(index+1);
                lastComparableLine = index+1;    
            }    
                
        });
        return lineNumbers;
    }
}