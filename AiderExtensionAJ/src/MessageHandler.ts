import * as vscode from 'vscode';
import { AiderIntegration } from './AiderIntegration';

export class MessageHandler {                                                                                                  
    constructor(                                                                                                               
        private readonly aiderIntegration: AiderIntegration,                                                                   
        private readonly webview: vscode.Webview                                                                               
    ) {}                                                                                                                       
                                                                                                                               
    async handleMessage(message: any): Promise<void> {                                                                         
        switch (message.type) {                                                                                                
            case 'runAider':                                                                                                   
                await this.handleRunAider(message);                                                                            
                break;                                                                                                         
            case 'getHistory':                                                                                                 
                await this.handleGetHistory();                                                                                 
                break;                                                                                                         
            case 'clearHistory':                                                                                               
                await this.handleClearHistory();                                                                               
                break;                                                                                                         
            default:                                                                                                           
        }                                                                                                                      
    }                                                                                                                          
                                                                                                                               
    private async handleRunAider(message: { prompt: string, mode: 'edit' | 'chat' }): Promise<void> {                          
        const result = await this.aiderIntegration.runAiderCommand(message.prompt, message.mode);                              
        this.webview.postMessage({ type: 'aiderResult', result });                                                             
    }                                                                                                                          
                                                                                                                               
    private async handleGetHistory(): Promise<void> {                                                                          
        const history = await this.aiderIntegration.getAiderHistory();                                                         
        this.webview.postMessage({ type: 'aiderHistory', history });                                                           
    }                                                                                                                          
                                                                                                                               
    private async handleClearHistory(): Promise<void> {                                                                        
        await this.aiderIntegration.clearAiderHistory();                                                                       
        this.webview.postMessage({ type: 'historyClearedS' });                                                                 
    }                                                                                                                          
}                  