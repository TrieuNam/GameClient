
import { BaseView, ViewLayer } from 'modules/common/BaseView';

@BaseView.registView 
export class FillView extends BaseView {
    protected viewRegcfg = {
        UIPackName: "FillBlank",
        ViewName: "FillView",
        LayerType: ViewLayer.Top,
    };
}