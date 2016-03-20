HTMLElement.prototype.addClass=function(cls){
  if(!this.hasClass(cls)){
       this.className += ' ' + cls;
   }
};
HTMLElement.prototype.hasClass=function(cls){
   if(this.className.split(' ').indexOf(cls)!=-1){
    return true;
  }
  return false;
};
function  Dialog(options){
    this.title=options.title||null;
    this.content=options.content||null;
    this.width=options.width;
    this.height=options.height;
    this.ok=options.ok||function(){};
    this.cancel=options.cancel||function(){};
    this.init();
}
Dialog.prototype={
    init:function(){
    	this.instance=null;
    	this.mask=null;
    	this.create();
        this.layout();
        this.addEvents();
    },
    create:function(){
    	var mask=document.createElement('div');
    	mask.id='dialog-mask';
    	document.body.appendChild(mask);
    	this.mask=document.getElementById('dialog-mask'); //添加遮罩层      
        var container =document.createElement('div');
        container.id='dialog-container';
        container.className='dialog';
        var html="";
            html+="<div class='dialog-title'>"+this.title+"</div>";
            html+="<div class='dialog-content'>"+this.content+"</div>";
            html+="<button type='button' data-type='ok'>确定</button>";
            html+="<button type='button' data-type='cancel'>取消</button>";
        container.innerHTML=html;
        document.body.appendChild(container);
        this.instance=document.getElementById('dialog-container');
    },
    layout:function(){
        /*var self=this;
        self.instance.addClass('dialog');*/
        /*var link=document.createElement('link');
            link.type='text/css';
            link.rel='stylesheet';
            link.href='http://localhost/list/index/scripts/dialog.css';
        document.head.appendChild(link);*/
    },
    show:function(ele){
       ele.style.display="block";
    },
    hide:function(ele){
       /*ele.style.opacity=0;
       ele.style.display="none";*/
      // ele.parentNode.removeChild(ele.childNodes(0));
      document.body.removeChild(ele);
    },
    addEvents:function(){
       var self=this;
       /*self.instance.getElemnetsByClassName('title')[0].innerHTML=self.title;
       self.instance.getElementsByClassName('content')[0].innerHTML=self.content;*/
       if(self.width&&self.height){
         self.instance.style.width=self.width;
         self.instance.style.height=self.height;
       }else{
       	 self.instance.style.width='500px';
       	 self.instance.style.height='500px';
       }
       self.show(self.instance);
       self.instance.addEventListener('click',function(e){
           if(e.target.dataset.type=='ok'){
               //
               self.hide(self.mask);
               setTimeout(function(){
                   self.ok();
                   self.hide(self.instance);
               },100);
           }else if(e.target.dataset.type=='cancel'){
               self.hide(self.mask);
               setTimeout(function(){
                   self.cancel();
                   self.hide(self.instance);
               },100);               
           }
       },false);
    }
};