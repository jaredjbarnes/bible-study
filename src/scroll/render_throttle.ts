export class RenderThrottle {
  private requestId: number | null;
  private _render: ()=>void;

  constructor(onRender: ()=>void){
    this._render = onRender;
  }

  requestUpdate(){
    const hasRequestId =  this.requestId != null;

    if (!hasRequestId){
      this.requestId = requestAnimationFrame(()=>{
        this.requestId = null;
        this._render();
      });
    } 
  }
}