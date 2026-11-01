'use client';
import {Component,type ReactNode} from 'react';
export class ModelPreviewBoundaryV733 extends Component<{children:ReactNode;onRetry:()=>void},{failed:boolean;attempt:number}>{
 state={failed:false,attempt:0};
 static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<div role="alert"><span aria-hidden="true" style={{fontSize:64}}>🧍</span><p>Das 3D-Modell konnte nicht geladen werden. Die übrige Anwendung bleibt verfügbar.</p><button type="button" onClick={()=>{this.props.onRetry();this.setState(s=>({failed:false,attempt:s.attempt+1}));}}>Erneut versuchen</button></div>:<div key={this.state.attempt}>{this.props.children}</div>;}
}
