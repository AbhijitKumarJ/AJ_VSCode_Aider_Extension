import { useState, useEffect } from 'react';                                                                                   
                                                                                                                                
 declare function acquireVsCodeApi(): any;                                                                                      
                                                                                                                                
 interface VSCodeApi {                                                                                                          
     postMessage: (message: any) => void;                                                                                       
     // Add other methods as needed                                                                                             
 }                                                                                                                              
                                                                                                                                
 const apiCache: { api: VSCodeApi | null } = { api: null };                                                                     
                                                                                                                                
 export const useVSCodeApi = (): VSCodeApi | null => {                                                                          
     const [vscode, setVscode] = useState<VSCodeApi | null>(apiCache.api);                                                      
                                                                                                                                
     useEffect(() => {                                                                                                          
         if (!apiCache.api) {                                                                                                   
             try {                                                                                                              
                 const acquiredApi = acquireVsCodeApi();                                                                        
                 apiCache.api = acquiredApi;                                                                                    
                 setVscode(acquiredApi);                                                                                        
             } catch (error) {                                                                                                  
                 console.error('Failed to acquire VS Code API:', error);                                                        
             }                                                                                                                  
         }                                                                                                                      
     }, []);                                                                                                                    
                                                                                                                                
     return vscode;                                                                                                             
 };             