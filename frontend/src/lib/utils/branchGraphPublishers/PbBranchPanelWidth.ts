import { EnumHtmlIds } from "../../enums";
import { DerivedPublisher } from "../../publishers";

export class PbBranchPanelWidth extends DerivedPublisher<number>{
    getDerivedValue() {
        const elem = document.querySelector(`#${EnumHtmlIds.branchPanelContainer}`);
        if(!elem)
            return 0;

        return elem.getBoundingClientRect().width;
    }
    onChange(){
        
    }


}