import IUserDefineComponent from "../../basiscore/IUserDefineComponent";
import BasisPanelChildComponent from "../BasisPanelChildComponent";

export default class BusinessSelectorComponent extends BasisPanelChildComponent {
  constructor(owner: IUserDefineComponent) {
    super(owner, "data-bc-bp-business-container");
  }
}
