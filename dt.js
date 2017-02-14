(function($){
	$.fn.dataTable=function(options)
	{ 
		// Datatable ilk özellikler.	
		var settigns=$.extend(true,{
			obj:this,// Obje. Çeşitli işlemlerde kullanılacak.
			id:this.attr("id"),// Obje ID. Arama, sıralama ve sayfalama gibi işlemlerde kullanılacaktır.
			// Tablo verileri xml dosyasından çağrıldı.
			dataXML:function(data,dataUrl){
				var dt=[];
				$.ajax({
					type:"GET",
					url:dataUrl,
					dataType:"xml",
					success:function(xml){
						var nodes=xml.documentElement.childNodes;
						$(xml).find(nodes).each(function(i){
							if(nodes[i].nodeType==1){
								node=nodes[i].childNodes;
								var rows=[];
								var j=0;
								$(xml).find(node).each(function(r){
									if(node[r].nodeType==1){
										rows[j]=node[r].firstChild.nodeValue;
										j++;
									}
								});
								dt.push(rows);
							}
						});
						data(dt);
					}
				});
			},
			//Tablo verileri veritabanından çağrıldı.
			dataServer:function(data,dataUrl){
				$.ajax({
					type:"GET",
					url:dataUrl,
					dataType:"json",
					success:function(query){
						data(query);
					},
					error:function(){
						console.log("error");
					}
				});
			}
		},$.fn.dataTable.defaults,options);
		//Gösterilecek kayıtların kaynağı bakıkımında dataSource kaynağı belirlenmektedir
		if(options.init.dataXML==null && options.init.dataServer==null){
			settigns.init.dataTemp=settigns.init.dataSource;// dataSource veri dizisinin bir kopyası dataTemp dizisinde tutulsun. Örnek arama sonucundaki veri sıralama yapılsın veya sayfalansın.
			createDatatable(settigns);
		}
		else if(options.init.dataXML!=null){
			settigns.dataXML(function(data){
				settigns.init.dataSource=data;// XML verisi gönderilirse datasource xml verisi ekle.
				settigns.init.dataTemp=settigns.init.dataSource;
				createDatatable(settigns);
			},options.init.dataXML);
		}
		else if(options.init.dataServer!=null){
			settigns.dataServer(function(data){
				settigns.init.dataSource=data;// Sunucu taraflı veri ekle.
				settigns.init.dataTemp=settigns.init.dataSource;
				createDatatable(settigns);
			},options.init.dataServer);
		}
	}
	$.fn.dataTable.defaults={	
		init:{
			name:"dataTable",			
			id:"dataTable",
			thema:"w1",// Tema
			dataSource:[],// Datatable veri kaynağı. Dizi, XML ve Mysql. Eğer sade php kullanılıyorsa dt.php deki dt klasına database bilgisi ve sql sorugusunu göndermeliyiz. Framework kullanılıyorsa Datatable controller ın liste fonksiyonunda bir modelden bir dizi oluşturmalıyız. 
			dataTemp:[],// Arama ve sıralama işleminde kullanılacak. 
			css:{width:"700px"},// Kurulum esnasında style tagına yapılacak değişiklikler.
			class:"tb_datatable"
		},
		header:{
			title:"TB Datatable",// Datatable Başlığı
			show:[10,20,30,50,100],// Sayfalama seçeneği.
			showText:"Gösterme:",
			search:false,//Arama kutusu seçeneği.
			css:"100%"
		},
		content:{
			columns:{
				text:["ID","SUTUN1"],// Sütünların gösterim metni.
				id:false,// false Değer id Datatable da gösterilmeyecek.
				sort:false,// Sütun bszlı sıralama seçneği.
				css:"",
				check:{
					link 	: "",
					sort 	: 0
				},
				detail:{
					ok 		: false,// Detay sütunu seçeneği.
					text 	: "Detay",
					link 	: "",
					img 	: "",
					sort 	: 1
				},
				edit:{
					ok 		: true,// Düzeltme sütunu seçeneği.
					text 	: "Düzelt",
					link	: "",
					img		: "img/edit.png",
					sort 	: 2
				},
				delete:{
					ok:false,// Silme sütunu seçeneği.
					text:"Sil",
					link:"",
					img:"img/delete.png",
					sort:3
				}
			},
			rows:{},
			nodata:"Gösterilecek kayıt bulunamadı.",
			css:""
		},
		footer:{
			info:{ count:" kayıttan ",between:" arası kayıt gösterildi."},
			page:{
				number:1,
				first:"İlk Sayfa",
				next:"Sonraki",
				prev:"Önceki",
				last:"Son Sayfa",
			},
			css:""
		}
	}

	function createDatatable(settigns){
		// Seçeneklere göre Datatable özelik ekleme.
		var show='<span>'+settigns.header.showText+'</span>';
			show+='<select id="selShow">';
		$.each(settigns.header.show,function(i,v){
			show+='<option id="'+v+'">'+v+'</option>';
		});
		show+='</select>';
		var search="";
		if(settigns.header.search){
			search+='<span>&#128270;</span>';
			search+='<input type="text" id="txtSearch"></input>';
			search+='<select id="selSearch"><option value="0">Tümü</option>';
			$.each(settigns.content.columns.text,function(i,v){
				search+='<option value="'+(i+1)+'">'+v+'</option>';
			});
			search+='</select>';			
		}
		//Datatable oluşturulmaktadır.
		var dataTable='<div class="main">'+
				'<div class="header">'+
					'<h1>'+settigns.header.title+'</h1>'+
					(show.length>20 ? '<div class="show">'+show+'</div>':'')+
					(search!='' ? '<div class="search">'+search+'</div>':'')+
				'</div>'+
			'</div>';
		settigns.obj.append(dataTable);
		settigns.obj.addClass(settigns.init.class);
		settigns.obj.css(settigns.init.css);
		createContent(settigns);// Dinamik veri kısmı createContent fonksiyonunda oluşturulmaktadır.
		// Arama ve Filtreleme yap.
		$("#"+settigns.id+" .search #txtSearch").keyup(function(){
				searchTable(settigns,$(this).val(),$("#"+settigns.id+" .search #selSearch").val());
		});
		// Sayfa gösterimi değişirse.
		$("#"+settigns.id+" .show #selShow").on("change",function(){
			createContent(settigns);
		});
	}
	// Datatable veri ile ilgili kısmı bu fonksiyonda oluşturulmaktadır. Bu fonnksiyon şimdilik 3 yerde çağrılacaktır.
	function createContent(settigns){
		$("#"+settigns.id+" div[class=content]").remove();// Daha önce aynı Datatable veri(content) kısmı var ise sil. Bu işlem arama, sırala ve sayfalamada tekrar veri listelenmesini engeleyecek.
		// Datatable kayıtlar ekleniyor.
		var col=settigns.content.columns;// Sürekli uzun yazmak yerine col değişkenine atandı.
		var th='';
		$.each(col.text,function(i,v){
			th+='<th class="'+(col.sort ? 'sort':'')+' c'+i+'">'+v+'</th>';// Sütun style sınıfına c+i eklendi. Her sütuna has özellikler olabilir. 
		});
		var tf='';
		$.each(col.text,function(i,v){
			tf+='<th class="thfoot">'+v+'</th>';// Sütun style sınıfına c+i eklendi. Her sütuna has özellikler olabilir. 
		});
		th+=(col.detail.ok ? '<th class="detail">'+col.detail.text+'</th>' :'');// Detay seçeneği kontrol
		tf+=(col.detail.ok ? '<th class="detail">'+col.detail.text+'</th>' :'');
		th+=(col.edit.ok ? '<th class="edit">'+col.edit.text+'</th>' :'');// Düzeltme seçeneği kontrol
		tf+=(col.edit.ok ? '<th class="edit">'+col.edit.text+'</th>' :'');
		th+=(col.delete.ok ? '<th class="delete">'+col.delete.text+'</th>' :'');// Silme seçeneği kontrol
		tf+=(col.delete.ok ? '<th class="delete">'+col.delete.text+'</th>' :'');
		var tr='';
		$.each(settigns.init.dataSource,function(i,row){
			tr+='<tr>';
			$.each(row,function(j,field){
				tr+='<td>'+field+'</td>';
			});	
			tr+=(col.detail.ok ? '<td class="detail"><a href="'+col.detail.link+row[0]+'">'+(col.detail.img.length ? '<img src="'+col.detail.img+'">':col.detail.text)+'</a></td>' :'');
			tr+=(col.edit.ok ? '<td class="edit"><a href="'+col.edit.link+row[0]+'">'+(col.edit.img.length ? '<img src="'+col.edit.img+'">':col.edit.text)+' </a></td>' :'');
			tr+=(col.delete.ok ? '<td class="delete"><a href="'+col.delete.link+row[0]+'">'+(col.delete.img.length ? '<img src="'+col.delete.img+'">':col.delete.text)+'</a></td>' :'');
			tr+='</tr>';
		});
		var colspan=0;// Veri yok açıklamasını yazdırmak için tanımlandı. Ve hesaplandı.
		(col.detail.ok ? colspan+=1:colspan=colspan);
		(col.edit.ok ? colspan+=1:colspan=colspan);
		(col.delete.ok ? colspan+=1:colspan=colspan);
		tr=(tr.length>0 ? tr:'<tr><td style="text-align:center;font-size:15px;color:#c00" colspan="'+(col.text.length+colspan)+'">'+settigns.content.nodata+'</td></tr>');// Veri yoksa açıklama yaz.
		var pageCount=0;
		// Sayfa sayyısı belirleniyor. Ve aynı gösterim değerine göre veriler sayfalara bölünüyor.
		$.each(settigns.init.dataSource,function(i,v){
			if(i%($("#selShow option:selected").val())==0){// Seçili gösterim değeri bütün verinin kaçta kaçı.
				pageCount++;
			}
		});
		// Sayfalama oluştur. next-prev-last-1 2 3
		var pagingTag="";
		pagingTag+=(pageCount>2 ? '<a class="first" href="#">'+settigns.footer.page.first+'</a>':'');
		pagingTag+=(pageCount>1 ? '<a class="prev" href="#">'+settigns.footer.page.prev+'</a>':'');
		pagingTag+='<div class="pages"><span></span>';
		for (var i = 1; i <= 3; i++) {// Sayfa sayısı 3 sayfadan fazlaysadiğer sayfa numaraları pagingRows fonksiyonunda gizlenecek.
			pagingTag+=(pageCount>i ? '<a class="page p'+i+'" href="#">'+i+'</a>':'');
		}
		pagingTag+='<span></span></div>';
		pagingTag+=(pageCount>1 ? '<a class="next" href="#">'+settigns.footer.page.next+'</a>':'');
		pagingTag+=(pageCount>2 ? '<a class="last" href="#">'+settigns.footer.page.last+'</a>':'');
		var content='<div class="content">'+
			'<table class="data-table">'+
				'<thead>'+
					'<tr>'+th+'</tr>'+
				'</thead>'+
				'<tfoot>'+
					'<tr>'+tf+'</tr>'+
				'</tfoot>'+
				'<tbody>'+
					tr+
				'</tbody>'+
			'</table>'+
			'<div class="footer">'+
				'<div class="info"><p>Kayıt yok.</p></div>'+
				'<div class="paging">'+pagingTag+'</div>'+
			'</div>'+
		'</div>';
		$("#"+settigns.id+" .main").append(content);
		pagingRows(settigns);
		// Sütun bazlı sıralama yap.
		$("#"+settigns.id+" .content table thead tr th").click(function(e){
			if(col.sort){
				e.preventDefault();
				var index=$("#"+settigns.id+" .content table thead tr th").index(this);
				var css=$("#"+settigns.id+" .content table thead tr th:eq("+index+")").attr("class");
				if(css!="detail" && css!="edit" && css!="delete")// Detail, Edit ve Delete sütunları tıklanmadığında.
					sortTable(index,settigns);
			}
		});
		// Sayfalama gösterimi
		$("#"+settigns.id).find(".paging a").on("click",function(e){
			e.preventDefault();
			var index=$("#"+settigns.id+" .paging a").index(this);
			var css=$("#"+settigns.id+" .paging a:eq("+index+")").attr("class");
			var paged=0;// Gösterimde olan sayfa numarası.
			var page=0;//Gösterime girecek sayfa numarası
			$("#"+settigns.id+" .paging .pages a").each(function(i,v){// Hangi sayfanın gösterimde olduğunu bul.
				if($(v).hasClass("paged")){
					paged=parseInt($(v).text());
					return false;
				}
			});
			// Yeni gösterim numarası tıklanan seçeneğe göre belirle.
			if(css=="first")
				page=1;
			else if(css=="prev" && paged!=1)// Prev tıkklanırsa ve aynı zamanda Gösterim sayfası ilk sayfa değilse gösterim sayfasını bir azalt.
				page=paged-1;
			else if(css=="next" && paged!=pageCount)// Gösterim sayfası son sayfa değilse. Gösterim sayfası bir artır.
				page=paged+1;
			else if(css=="last")
				page=pageCount;
			else if(css!="next" && css!="prev")
				page=parseInt($("#"+settigns.id+" .paging a:eq("+index+")").text());// String değer int çevrilmelidir. Yoksa 1+1=2 değilde 1+1=11 olarak hesaplar. Bu problem 4 saatimi aldı. 
			if(page!=0)// Yukarıdaki koşullar sağlandı ve yeni sayfa gösterimi yapılabilir.
				pagingRows(settigns,page);
		});
	}
	// Satırları gizle-göster. Bu fonksiyon altı yerde çağrılacaktır.
	function pagingRows(settigns,page=1){
		var show=$("#"+settigns.id+" #selShow option:selected").val();// Sayfada gösterim değeri.
		$("#"+settigns.id+" table tbody tr").css("display","none");// Tüm satırları göster.
		var between=[];// Arasaı kaıyıtlar gösterildi bilgisini tutacak.
		between[0]=(page-1)*show;
		between[1]=between[0];
		for (var i = (page-1)*show; i < page*show; i++) {// Belilerlenen sayfadaki kayıtlar gösterilecek.
			if($("#"+settigns.id+" table tbody tr:eq("+i+")").length){
				$("#"+settigns.id+" table tbody tr:eq("+i+")").css("display","table-row");
				between[1]++;
			}
		}
		$("#"+settigns.id+" .info p").text(settigns.init.dataSource.length+settigns.footer.info.count+between[0]+'-'+between[1]+settigns.footer.info.between);// Kayıt bilgisi.
		var pagesCount=Math.ceil(settigns.init.dataSource.length/show); // Sayfa sayısı ve bir üst sayıya yuvarlama yapılıyor.
		$("#"+settigns.id+" .paging a").css("color","");// Sıfırla
		$("#"+settigns.id+" .paging a").attr("href","#");// Sıfırla
		if(page==1){// İlk sayfa gösterildiğinde prev ve first disable yap.
			$("#"+settigns.id+" .paging .prev").attr("href",null);
			$("#"+settigns.id+" .paging .prev").css("color","#bbb");
			$("#"+settigns.id+" .paging .first").attr("href",null);
			$("#"+settigns.id+" .paging .first").css("color","#bbb");
		}
		else if(page==pagesCount){ // Son sayfa gösterldiğinde next ve last disable yap.
			$("#"+settigns.id+" .paging .next").attr("href",null);
			$("#"+settigns.id+" .paging .next").css("color","#bbb");
			$("#"+settigns.id+" .paging .last").attr("href",null);
			$("#"+settigns.id+" .paging .last").css("color","#bbb");
		} 
		// 3 ten fazla sayfa varsa sayfa 3 sayfa numarası dışında diğerlerin yerine (...) nokta göster.
		if(pagesCount>3){
			$("#"+settigns.id+" .paging .pages a").removeClass();// Gösterim olmayacak sayfaların numarasını varsayılan yap.
			var pagesTag=0; // Sayfa numaraları ve ... oluştur.
			$("#"+settigns.id+" .paging .pages span").text("");
			if(page==1){
				pagesTag=page;
				$("#"+settigns.id+" .paging .pages span:eq(1)").text("...");
			}
			else if(page==2){
				pagesTag=page-1;
				$("#"+settigns.id+" .paging .pages span:eq(1)").text("...");
			}
			else if(page==pagesCount-1){
				pagesTag=page-1;
				$("#"+settigns.id+" .paging .pages span:eq(0)").text("...");
			}
			else if(page==pagesCount){
				pagesTag=page-2;
				$("#"+settigns.id+" .paging .pages span:eq(0)").text("...");
			}
			else if(page>2 && page<pagesCount-1){
				pagesTag=page;
				$("#"+settigns.id+" .paging .pages span:eq(0)").text("...");
				$("#"+settigns.id+" .paging .pages span:eq(1)").text("...");
			}
			for(var i=0;i<3;i++){// Seçilen sayfa numarası etrafında veya yanında iki numara daha text değerleri verildi.
				$("#"+settigns.id+" .paging .pages a:eq("+i+")").text(pagesTag+i);
				$("#"+settigns.id+" .paging .pages a:eq("+i+")").addClass("page p"+(pagesTag+i));
			}
			$("#"+settigns.id+" .paging .p"+page).addClass("paged");//Hangi sayfanın gösterimde olduğunun belirleyici özeliği.
		}
	}
	// Sütun bazlı sıralama fonksiyonu.
	function sortTable(index,settigns){
		var sorted=("#"+settigns.id+" .content table tr th:eq("+index+")");// Sıralama yapılacak sütun.
		var asc=$(sorted).hasClass("sorted-asc");
		var temp1=[];// Geçici bir dizi tanımlandı.
		var temp2=[];		
		// Uzun değişken adı yazmak yerine kısa temp1 dizisine veriler eklendi.
		$.each(settigns.init.dataSource,function(i,v){
			temp1.push(v);
			temp2.push(v);
		});
		console.log(temp1);
		var fieldCount=temp1[0].length;// Veri tablosundaki sütun sayıyı bulundu.
		// Sıralama
		if(asc) { // A-Z veya 0-9 sıralama yap.
			for (var i = 0; i < temp1.length; i++) {
				for (var j = 0; j < temp1.length; j++) {
					if(temp1[i][index]>temp2[j][index]) {// Seçilen sütün değerlerini karşılaştır.
						for (var k = 0; k < fieldCount; k++) {// Koşul sağlandıysa tüm sütunların yerini değiştir.
							var temp=temp1[i][k];
							temp1[i][k]=temp2[j][k];
							temp2[j][k]=temp;
						}
					}
				}
			}
		}
		else {// Z-A veya 9-0 sıralama yap.
			for (var i = 0; i < temp1.length; i++) {
				for (var j = 0; j < temp1.length; j++) {
					if(temp1[i][index]<temp2[j][index]) {
						for (var k = 0; k < fieldCount; k++) {
							var temp=temp1[i][k];
							temp1[i][k]=temp2[j][k];
							temp2[j][k]=temp;
						}
					}
				}
			}
		}
		// dataSource dizisi yeni hali
		settigns.init.dataSource=[];
		$.each(temp1,function(i,v){
			settigns.init.dataSource.push(v);
		});
		// Var olan DataTable veri kısmını kaldır yerine yenisi oluştur.
		createContent(settigns);
		if(asc)// Sıralama yapılan sütunu belirle.
			$(sorted).addClass("sorted-desc");
		else
			$(sorted).addClass("sorted-asc");
	}
	// Sütun bazlı sıralama fonksiyonu. Text Value, Option Value
	function searchTable(settigns,tval,oval){
		var temp=[];// Geçici dizi tanımlanıyor.			
		if(tval.length>0){// Arama kutucuğuna en az 3 karekter girildiğinde dataSource güncelle.
			$.each(settigns.init.dataSource,function(i,v){// Aramanın yapıldığı döngü.
				$.each(v,function(j,va){
					if((oval==0 && va.match(tval)!=null) || (oval==j+1 && va.match(tval)!=null) ){
						temp.push(v);// Arama metni ile eşleşen satırları temp disisine yükle.
						return false;
					}
				});
			});
			// dataSource dizisi verilerini güncelle.
			settigns.init.dataSource=temp;
		}
		else{
			settigns.init.dataSource=settigns.init.dataTemp;// dataSource dizisinin verilerini geri yükle.
		}
		createContent(settigns);
	}
})($);