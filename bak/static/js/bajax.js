/*------------------------------------------------------------------------------
 * bAjax - A tiny Ajax library
 * Version 1.0.1
 * by Boris Ding P H, http://bajax.borisding.com
 * Copyright (c) 2009 Boris Ding P H. All Rights Reserved.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307 USA
 *------------------------------------------------------------------------------
 */  

var bajax = (function(){
					  
  var action = {
  // start implementing ajax
	init: function(option){
	 attr = option;
	 
	//this.checkId();
	this.checkURL();
    this.initAjax();
   },// end init
	
	//check for url
	checkURL: function(){		
	 if(typeof attr.url == "undefined"){
	  alert(error.e002);
	  return false;
	 }else if(attr.url == null || attr.url ==""){
	  alert(error.e003);
	  return false;
	 }				
	},
	
	// filter data
	filteredData: function(){
	 var data;
	 if(typeof attr.data != "undefined"){
		 
		if(attr.data != ""){
		 data = attr.data + "&rid=" + Math.random(); 	
		}else{
		  data = "rid=" + Math.random();	
		}
	  //else undefined	 
	 }else{
	  data = "rid=" + Math.random();	 
	 }
	 return data;	
	},
	
	//check for type
	checkType: function(){
	 var type;
	 
	 switch(attr.type){
	  case "xml":
	  case "json":
	  return attr.type;
	  break;
  
	  default:
	  return "text";		 
	 }//end switch
    },
	
	// implementing post method
	postMethod: function(){
	var url =  attr.url;
	var data = this.filteredData();
	xhr.open("POST", url, true);
 	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
 	xhr.send(data);
	},
	
	// implementing get method
	getMethod: function(){     	
    var url =  attr.url + "?" + this.filteredData();
	
	// if xml
	if(this.checkType() == "xml"){
	  if(xhr.overrideMimeType){
       xhr.overrideMimeType("text/xml");
	  }
	}
	
	xhr.open("GET", url, true);
 	xhr.send(null);
	},
	
	// fetch result from the server	 
	retrieveResult: function(){
    if(xhr.readyState == 4){
	 	
	  if(xhr.status == 404){
	   alert(error.e404);	  
	  }
	  
	  if(xhr.status == 408){
	   alert(error.e408);	  
	  }
	  
      if(xhr.status == 200 || xhr.status == 304){
		var responseData;
		
	   // xml data
	   if(typeof attr.type != "undefined" && bajax.checkType() == "xml"){
		 responseData = xhr.responseXML;
		 
	   // json data
	   }else if(typeof attr.type != "undefined" && bajax.checkType() == "json"){         
		 responseData = eval("(" + xhr.responseText + ")");  
	   }
	   
	   // plain text
	   else{
        responseData = xhr.responseText;
	   }

       attr.callback(responseData);
      }	  
	 }// end if complete	 
	},
	
	// decide which method to use
	decideMethod: function(){
	
	xhr.onreadystatechange = this.retrieveResult;
		
	if(typeof attr.method != "undefined"){		 
	   switch(attr.method){
		 //send data with POST method  
		 case "POST":
		  this.postMethod();
		  break;
		  default:
		  // send data with GET method,by default
		   this.getMethod();
	   }//end switch	   
	 }else{
	   // send to server with GET method if not specified
	   this.getMethod();	 
	 }
	},
	
	//init ajax
	initAjax: function(){
	xhr = this.	createXHR();
	// check for xhr object
	if(xhr == null){
	 alert(error.eoo4);
	 return false;
	}else if(xhr.readyState != 0){
	 xhr.abort();	
	}
	 this.decideMethod(); 	
	},

	//creating XMLHttpRequest object
	createXHR: function(){
	 var XHR = null;
	 if(typeof XMLHttpRequest != "undefined"){
		 XHR = new XMLHttpRequest();
		 return XHR;
	 }else if(window.ActiveXObject){
	   var arrayMSXml = ["MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0"];
	   var i = 0;
	   var lengthMSXml = arrayMSXml.length;
	   
	   while(i < lengthMSXml){
		   try{
			  XHR = new ActiveXObject(arrayMSXml[i]);
			  return XHR;
		   }catch(xhrError){}
		   i++;
	   }//end while
	 }//end else
	 throw new Error("Failed to create XHR object!");
	},// end createXHR

//Manipulate ajax loader
//------------------------------------------------------------
	loader: function(tagID, loader){
	 document.getElementById(tagID).innerHTML = loader;	
	},
	
	clearLoader: function(tagID){
	 document.getElementById(tagID).innerHTML = "";		
	},

//Manipulate form data (serialization)
//------------------------------------------------------------
    serialized: function(formId){
		
	var arrayInput = Array();
	
		var form = document.getElementById(formId);
	    // check form element type, accordingly

		 var i = 0; 
		 while(i < form.elements.length){
			 
		  var field = form.elements[i];
		  
		  switch(field.type){
          // if button, submit, reset
		  case "button":
          case "submit":
          case "reset":
          break; // buttons, do nothing
		  
          // if text, hidden, password
		  case "text":
          case "hidden":
          case "password":	 
          arrayInput.push(this.encodeValue(field.name, field.value));
		  break;
		  
		  // if radio, checkbox
		  case "radio":
          case "checkbox":
          if(!field.checked){
           break;}
		  
		  default: //the rest, such as select
		  if(field.type == "select-one"){
		  arrayInput.push(this.encodeValue(field.name, field.options[field.selectedIndex].value));
		  }else if(field.type == "select-multiple"){
			  
		  // if multiple, check selected and push into array
		  var mSn = 0;
		  for(var j = 0; j < form.elements[field.name].length; j++){			 
             if(form.elements[field.name].options[j].selected == true){
			   mSn++;
			   var mName = field.name + mSn;	 
			  arrayInput.push(this.encodeValue(mName, form.elements[field.name].options[j].value));
			 }
		   }//end for	   
		  }else{ // collect radio and checkbox
		   arrayInput.push(this.encodeValue(field.name, field.value));
		  }		

		 }//end switch
		  i++;
		 }// end while
         return arrayInput.join("&");		
	   },//end serialize
	   
	   encodeValue: function(name, val){
	     var input = encodeURIComponent(name);
         input += "=";
         input += encodeURIComponent(val);
         return input;
	   }	
  };
  return action;
})();


// compiled error messages
var error = {
	
 e404: "ERROR 404: Page was not found!",
 e408: "ERROR 408: Request Timeout! Please try again.",
 
 e000: "ERROR: 'id' is undefined!",
 e001: "ERROR: 'id' is null or empty!",
 
 e002: "ERROR: 'url' is undefined!",
 e003: "ERROR: 'url' is null or empty!",
 
 eoo4: "ERROR: Your browser does not support XHR object!"
 
};

// global variables
var attr = null;
var xhr = null;

