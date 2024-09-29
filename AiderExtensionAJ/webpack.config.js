const path = require('path');                                                                                                  
                                                                                                                                
 module.exports = {                                                                                                             
   target: 'web', // Ensure the target is set to 'web'                                                                          
   entry: {                                                                                                                     
     extension: './src/extension.ts',                                                                                           
     webview: './src/webview/index.tsx'                                                                                         
   },                                                                                                                           
   output: {                                                                                                                    
     path: path.resolve(__dirname, 'out'),                                                                                      
     filename: '[name].js',                                                                                                     
     libraryTarget: 'umd', // Use UMD to support both CommonJS and browser environments                                         
     globalObject: 'this' // Ensure the global object is correctly set                                                          
   },                                                                                                                           
   mode: 'development',                                                                                                         
   devtool: 'source-map',                                                                                                       
   externals: {                                                                                                                 
     vscode: 'commonjs vscode'                                                                                                  
   },                                                                                                                           
   resolve: {                                                                                                                   
     extensions: ['.ts', '.tsx', '.js', '.jsx']                                                                                 
   },                                                                                                                           
   module: {                                                                                                                    
     rules: [                                                                                                                   
       {                                                                                                                        
         test: /\.tsx?$/,                                                                                                       
         exclude: /node_modules/,                                                                                               
         use: [                                                                                                                 
           {                                                                                                                    
             loader: 'ts-loader'                                                                                                
           }                                                                                                                    
         ]                                                                                                                      
       },                                                                                                                       
       {                                                                                                                        
         test: /\.css$/,                                                                                                        
         use: ['style-loader',  {                                                                                               
           loader: 'css-loader',                                                                                                
           options: {                                                                                                           
             modules: true                                                                                                      
           }                                                                                                                    
         }]                                                                                                                     
       }                                                                                                                        
     ]                                                                                                                          
   }                                                                                                                            
 };           