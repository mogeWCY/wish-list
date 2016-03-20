(function(window){
	 /** @type {Array} 设置默认的数据 */
   var defaultData=[
   {
    type:'week',
    name:'每周任务',
    childs: []
   },
   {
    type:'day',
    name:'每日任务',
    childs:  []
   },
   {
    type:'comman',
    name:'普通任务',
    childs :[]
   },
   {
    type:'wish',
    name:'我的愿望',
    childs:[]
   }
];
var utils={
     isDOM: function (o) {
       return (
        typeof HTMLElement === 'object' ? o instanceof HTMLElement :
        o && typeof o === 'object' && o !== null && o.nodeType === 1 && typeof o.nodeName === 'string'
       );
      },
      getDataIndex:function(arr,type,obj){
         for(var i in arr){
          if(arr[i][type]==obj[type]){
            return i;
          }
         }
      },
      /**
       * 根据不同的类型，返回该类型在JSON数组中的次序
       * @param  {array}  data  --json数组
       * @param  {string} type  --'week'/'day'/'wish'/comman
       * @return {number}  返回次序
       */
      getTypeIndex:function(data,type){
        for(var i in data){
          if(data[i].type==type){
            return i;
          }
        }
      },
      /**
       * 验证输入框只能输入数字
       */
      validate:function(ele){
         var ele=this.isDOM(ele)?ele:document.getElementById(ele);
         ele.addEventListener('keypress',function(e){
            var e=e||window.event;
            var charCode;
            if(typeof e.charCode=='number'){
              charCode=e.charCode;
            }else{
              charCode=e.keyCode;
            }
            if(!/\d/.test(String.fromCharCode(charCode))){
              e.preventDefault();
            }
         },false);
      }
   };
   var ls=localStorage;
   var lsData={
        set:function(data){
           ls.setItem('data',JSON.stringify(data));
        },
        add:function(type,nowData){
          var data=this.get();
          var index=utils.getTypeIndex(data,type);
          data[index].childs.push(nowData);
          this.set(data);
        },
        /**
         * @param  {object} nowData 传入的对象
         * nowData.name   - 任务/愿望名称
         * nowData.time   - 时间戳
         * nowData.value  - 成就值
         * nowData.isFinshed -是否完成
         * 修改
         */
        delete:function(type,index){
          var data=this.get();
          var typeIndex=utils.getTypeIndex(data,type);
            data[typeIndex].childs.splice(index,1);
            this.set(data);
        },
        /**
         * @param  {object} nowData 传入的对象
         * nowData.name   - 任务/愿望名称
         * nowData.time   - 时间戳
         * nowData.value  - 成就值
         * nowData.isFinshed -是否完成
         * 根据传入的对象修改对应的数据
         */
        change:function(type,nowData,lastData){
           var data=this.get();
           var typeIndex=utils.getTypeIndex(data,type);
           /*找出是哪一种类型的，每周-每天-普通-愿望*/
           var dataIndex=utils.getDataIndex(data[typeIndex].childs,'time',lastData);
           data[typeIndex].childs[dataIndex]=nowData;
           this.set(data);
        },
        get:function(){
          /** 根据localstorage名来获取数据，返回的是数组 */
           if(ls.getItem('data')){
              return JSON.parse(ls.getItem('data'));
           }else{
            return {};
           }
        },
        /**
         * 使data按照arr中的顺序排序
         * example : 
         * data=[{name:1,age:'b'},{name:3,age:'c'},{name:2,age:'a'}]
         * arr=['a','b','c']
         * 则data sort后[{name:2,age:'a'},{name:1,age:'b'},{name:3,age:'c'}]
         */
        sorted:function(arr,type){
           var data=this.get();
           var typeIndex=utils.getTypeIndex(data,type);
           var childsData=data[typeIndex].childs;
           var newArr=new Array(childsData.length);
           for (var i = 0,len= childsData.length;i<len ;i++) {
                newArr[arr.indexOf(''+childsData[i].time)]=childsData[i];
           }
           data[typeIndex].childs=newArr;
           this.set(data);
        }
   };
   
   /**
    * [STATUS description]
    * @type {Object} 记录当前选中在哪个范围内，week,day,comman,wish
    * active: week,day,comman,wish,根据不同的状态来设置弹窗的标题
    * 
    */
   var status={
       activeType:'week', 
   };
   var dialogTpl=['<div>',
         '<label for=\'\'>任务名</label>',
         '<input type=\'text\' id=\'task_content\'>',
         '</div>',
         '<div>',
         '<label for=\'\'> 成就值</label>',
         '<input type=\'text\' id=\'task_value\'>',
         '</div>'].join("");
   var TITLES={
  	'week':'每周任务',
  	'day' :'每日任务',
  	'comman':'普通任务',
  	'wish':'我的愿望'
   };
   /**
    * @param  {string} state  判断是 add list/ change list 生成的框
    * @param  {array} values  change list 的时候传进来当前该list的name和value值
    * @param  {object} data   change list 的时候传进来当前该list的name和value，及time值，time值是主键
    */
  function dialog(state,values,data){
      var title=TITLES[status.activeType];
      var content=dialogTpl;
		  if(status.activeType=='comman'){
          content+="<div><label for=''>完成时间</label><input type='datetime-local'></div>";
      }
     var temp=new Dialog({
               width:'400px',
               height:'200px',
               title:title,
               content:content,
               ok:function(){
                 if(state=='add'){
                      addDataOk();
                   }else{
                      changeDataOk(data);
                   }
               }
            });
     var allInputs=document.getElementById('dialog-container').getElementsByTagName('input');
	   if(arguments.length==3){
	      [].forEach.call(allInputs,function(item,index){
               item.value=values[index];
	       });
	   }
     utils.validate('task_value');
 }
 /**
  * 语音输入生成的弹窗
  */
 function voiceDialog(){
       var title=TITLES[status.activeType];
       var content="<div><label for=''>";
       content+='任务名';
       content+="</label><input type='text' id='task_content' placeholder='此框可语音输入'></div>";
       content+="<div><label for=''>\
      成就值</label><input type='text' id='task_value'></div>";
      if(status.activeType=='comman'){
          content+="<div><label for=''>完成时间</label><input type='datetime-local'></div>";
      }
     var temp=new Dialog({
            width:'400px',
            height:'200px',
            title:title,
            content:content,
            ok:function(){
                addDataOk();
            }
     });
     voice2text();
     utils.validate('task_value');
 }
 /**
  * TaskList 组件，右边的list
  */
  var TaskList=function(){
  	this.init();
  };
  TaskList.prototype={
     init:function(){
     	this.cacheDOM();
      this.render();
     	this.bindEvents();
     },
     cacheDOM:function(){
     	  this.container=document.getElementsByClassName('tasks')[0];
        this.listItems=this.container.getElementsByTagName('li');
        this.checkBoxs=this.container.getElementsByTagName("input");
        this.dataContainer=document.querySelector('.task_list');
        this.title=this.container.getElementsByClassName('task_title')[0];
        this.allNums=document.getElementsByClassName('num');
        /**
         * 拖拽时开始的元素
         */
        this.dragSource=null;
        /**
         * 右键菜单生成-- 点击的元素
         */
        this.ctxtmenuSource=null;
        window.hasSorted=false;
        this.oMenu=document.getElementById('menu');
        this.voice=document.getElementById('voice');
     },
     /**
      * 根据不同的type渲染title和lists
      * 得到不同type下的list的总数目
      * 把type和index写到list上
      */
     render:function(){
          this.title.innerHTML=TITLES[status.activeType];
          var allData=lsData.get();
          this.getListTotal(allData);
          if(allData.length){
              var index=utils.getTypeIndex(allData,status.activeType);
              var html=template('test',allData[index]);
              this.dataContainer.innerHTML=html;
          }else{
           lsData.set(defaultData);
           this.dataContainer.innerHTML='';
        }
        for(var i=0,len=this.listItems.length;i<len;i++){
           this.listItems[i].dataset.type=status.activeType;
           this.checkBoxs[i].dataset.type=status.activeType;
           this.checkBoxs[i].dataset.index=i;
        }
     },
     bindEvents:function(){
     	var self=this;
      /**
       * 事件代理，监听click事件，change&&delete list
       */
      this.dataContainer.onclick=function(e){
          var e=e||window.event;
             if(e.target.tagName.toLowerCase()=='li'){
                  self.editItem(e.target);
             }else if(e.target.tagName.toLowerCase()=='input'&&e.target.type=='checkbox'){
                 self.delItem(e.target);
             }
        }
        /**
         * 监听dragenter事件，到达可放置的目标的时候触发该事件
         * 判断起始位置和到达位置是否为同一元素
         * 若拖拽排序动作完成，数据排序，重新写入
         */
       this.dataContainer.addEventListener('dragenter',function(e){
             if(e.target.tagName.toLowerCase()=='li'&&self.dragSource!=e.target){
               self.dragenter(e);
               if(window.hasSorted){
                  var allTimeSorted=[];
                for(var i=0,len=self.listItems.length;i<len;i++){
                     allTimeSorted.push(self.listItems[i].dataset.time);
                 }
                  lsData.sorted(allTimeSorted,status.activeType);
                }
             }
        },false);
       /**
        * 监听拖拽事件，拖拽开始
        */
        this.dataContainer.addEventListener('dragstart',function(e){
             if(e.target.tagName.toLowerCase()=='li'){
                    self.dragstart(e);
               }
        },false);
        /**
         * 监听自定义菜单事件
         * 触发后显示自定义的menu
         * 1500ms后菜单消失
         */
        this.dataContainer.oncontextmenu=function(e){
            e=e||window.event;
            if(e.target.tagName.toLowerCase()=='li'){
                   e.preventDefault();
                   self.ctxtmenuSource=e.target;
                   self.oMenu.style.display = "block";
                   self.oMenu.style.left = e.clientX + "px"; 
                   self.oMenu.style.top = e.clientY + "px";
                   e.preventDefault();
            }
            setTimeout(function(){
                 self.oMenu.style.display='none';
            },1500);
        };
        /**
         * 监听自定义右键菜单的点击行为
         * delete  && change list
         */
        this.oMenu.onclick=function(e){
           e=e||window.event;
           if(e.target.dataset.type=='edit'){
                self.editItem(self.ctxtmenuSource);                 
           }
          if(e.target.dataset.type=='delete'){
                var index=[].indexOf.call(self.listItems,self.ctxtmenuSource);
                self.delItem(self.checkBoxs[index]);
           }
        };
        /**
         * 点击语音输入图标，触发事件，执行voiceDialog
         */
        this.voice.onclick=function(){
              voiceDialog();
        }
     },
     /**
      * 修改list ，把当前数据传入dialog
      */
     editItem:function(ele){
                 var values=[];
                 var data={};
                 data.name=ele.getElementsByClassName('task_content')[0].innerText;
                 data.value=ele.getElementsByClassName('task_value')[0].innerText;
                 data.time=ele.dataset.time;
                 data.type=ele.dataset.type;
                 values.push(ele.getElementsByClassName('task_content')[0].innerText);
                 values.push(ele.getElementsByClassName('task_value')[0].innerText);
                 dialog('change',values,data);
     },
     /**
     * @param  {element} ele 
     * 删除某项元素
     */
     delItem:function(ele){
              var index=[].indexOf.call(this.checkBoxs,ele);
              var type=ele.dataset.type;
              this.deleteData(type,index);
              this.dataContainer.removeChild(this.listItems[index]);
              this.getListTotal(lsData.get());
     },
     dragenter:function(e){
        window.hasSorted=true;//已经排序
        var  e=e||window.event;      
        /**
         * 如果起始元素位于目标元素的前面，则插入到目标元素后面的节点的前一个
         */
        if(this.isBefore(this.dragSource,e.target)){
           e.target.parentNode.insertBefore(this.dragSource,e.target);
        }else{
           e.target.parentNode.insertBefore(this.dragSource,e.target.nextSibling);
        }
     },
     dragstart:function(e){
       var e=e||window.event;
       window.hasSorted=true;
       this.dragSource=e.target;
       e.dropEffect='move';
       e.dataTransfer.effectAllowed = 'move';
     },
     /**
      *判断a元素是否在b的前面
      * @return {bool} 若是则返回true,否则返回false
      */
     isBefore:function(a,b){
        if(a.parentNode==b.parentNode){
            for(var cur = a; cur; cur = cur.previousSibling){
               if(cur === b){
                return true;
               }
            }
        }
        return false;
     },
     /**
      * @param  {JSON Array} data 某个type下的数据
      * 数目渲染到左边的sidebar里
      */
     getListTotal:function(data){
        var self=this;
        var nums=[];
        for(var i in data){
           try{
             nums.push(data[i].childs.length);
           }catch(e){
              console.log(e);
           }
        }
        nums.forEach(function(item,index){
            self.allNums[index].innerText=item;
        });
     },
     /**
      * @param  {string} name   任务名
      * @param  {number} value  成就值
      * @param  {number} time   时间戳
      * 修改数据
      */
     changeData:function(name,value,time){
     	   var type=status.activeType;
           var temp={
              'name':name,
              'value':value,
              'time':time,
              'isFinshed':false
          };
         lsData.change(type,temp);
     },
     /**
      * @param  {string} type  类型，week/day/comman/wish
      * @param  {number} index 位置
      * 根据类型和位置删除掉该数据
      */
     deleteData:function(type,index){
            lsData.delete(type,index);
     }
  };
  var Sidebar=function(){
     this.init();
  };
  Sidebar.prototype={
  	init:function(){
       this.cacheDOM();
       this.bindEvents();
  	},
  	cacheDOM:function(){
       this.sideLists=document.querySelector('.lists');
  	},
  	bindEvents:function(){
      /**
       * 监听点击事件
       * 点击到+图标，弹出弹窗，生成弹窗
       * 点击到其他的不同类型，再次渲染，右边task lists改变
       */
     this.sideLists.addEventListener('click',function(e){
         var e=e||window.event;
         var type=e.target.dataset.type;
         if(e.target.tagName.toLowerCase()=='i'){
         	   status.activeType=type;
               dialog('add');
               return;
         }
         if(type){
         	 status.activeType=type;
             switch(type){
                  case 'week':
                      new TaskList().render();
                  break;
                  case 'day':
                      new TaskList().render();
                  break;
                  case 'comman':
                     new TaskList().render();
                  break;
                  case 'wish':
                      new TaskList().render();
                  break;
         }
       }
      },false);
  	}
  }
  /**
   * 弹窗的确定按钮绑定的函数
   * 把输入框的值存入localstorage
   */
  function addDataOk(){
     var box=document.getElementById('dialog-container');
     var nameInput=box.getElementsByTagName('input')[0];
     var valueInput=box.getElementsByTagName('input')[1];
     var nowTime=Date.now();
     var nowData={
     	 'name':nameInput.value,
     	 'value':valueInput.value,
     	 'isFinshed':false,
       'time':nowTime
     };
     if(status.activeType=='comman'){
     	   var time=document.getElementById('datetime-local');
     	   nowData.time=time;
     }
     if(nowData.name&&nowData.value){
          lsData.add(status.activeType,nowData);
          new TaskList().render();
     }
  }
  /**
   * @param  {json array} data 点击list，数据绑定到弹窗
   * 修改数据
   */
function changeDataOk(data){
     var box=document.getElementById('dialog-container');
     var nameInput=document.getElementById('task_content');
     var valueInput=document.getElementById('task_value');
     var nowData={
     	 'name':nameInput.value,
     	 'value':valueInput.value,
     	 'isFinshed':false,
       'time':data.time
     };
     if(status.activeType=='comman'){
     	var date=document.getElementById('datetime-local');
     	nowData.date=data;
     }
     if(nowData.name&&nowData.value){
          lsData.change(status.activeType,nowData,data);
          new TaskList().render();
     }
  }
  /**
   * web speech api 只支持chrome 把声音转成文字
   */
  function voice2text(){
     var recognition =new webkitSpeechRecognition();
    recognition.continuous=true;
     recognition.interimResults=false;
     recognition.onstart=function(){
       console.log('开始识别...');
    };
    recognition.onend=function(){
       console.log('停止识别!');
   };
   recognition.start();
  recognition.onresult=function(event){
      var i = event.resultIndex;
       if(event.results[i].isFinal){
               text= event.results[i][0].transcript;
               document.getElementById('task_content').value+=text;
               setTimeout(function(){
                  recognition.stop();
               },5000);
       }

}
} 
 window.onload=function(){
 	new Sidebar();
 	new TaskList();
 }
  /**
   * 日历组件，每个日期上可以存储事务
   * 写博客，4月1日前1000分
   */
})(window);