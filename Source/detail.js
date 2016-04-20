var casper = require('casper').create({
   /* clientScripts:  [
        'includes/jquery.js',      // These two scripts will be injected in remote
        'includes/underscore.js'   // DOM on every request
    ],*/
    pageSettings: {
        loadImages:  false,        // The WebPage instance used by Casper will
        loadPlugins: true,         // use these settings
		userAgent: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
    },
	viewportSize: {width: 1200, height: 800}
    //logLevel: "info",              // Only "info" level messages will be logged
    //verbose: true                  // log messages will be printed out to the console
});

var fs = require('fs');
var url='http://www.qualibat.com';
var col_head = 'companyname;address;phone;fax;email;qualification;Certificat RGE\n';
var valueall =[];
var valuehtml;
var home = 'http://www.qualibat.com/Views/';
var company_name='', address='', phone='', fax='', email='';
var data_file = '';
var readlist = fs.read('list.txt');
var listarray = (readlist.trim()).split('\n');
var value_quali ='';
var value_rge = '';
var j=0;
var pdf_location='pdf/';

casper.start(url,function(response){

	if (response == undefined || response.status >= 400){
		this.echo('error page.');
		this.capture('error_home.png');
	}else{
		//this.capture('homepage.png');
		//require('utils').dump(listarray);
		fs.write('get_detail.csv',col_head,'w');
		//loopURL();
		test();
	}
});

function test(){
	casper.then(function(){
		this.repeat(listarray.length,function(){
			this.thenOpen(home+listarray[j]);
			casper.waitFor(function check(){
				return this.exists('#contenu_page');
			},function then(){
				this.capture('img/load_page.png');
				extractDetail();
			},function timeout(){
				this.echo('Cannot load page detail');
				this.capture('page_error.png');
			},60000);
			this.then(function(){
				j++;
			});
		})
	});
}


function extractDetail(){
	company_name=''; 
	address=''; 
	phone='';
	fax='';
	email='';
	value_quali='';
	value_rge='';

	casper.then(function(){
		this.then(function(){
		data_file = '';
		var tmp_datas = this.getElementsInfo('.recherche_entreprise_detail:nth-of-type(1) > tbody > tr');
			for(var i=0;i<tmp_datas.length;i++){
				var tmp_value = '';
				tmp_value = (tmp_datas[i].html).replace(/\s+/g,' ');
				if(tmp_value.match(/(<th>\s.*?<\/th>\s<td>\s<strong>)(\s+.*?|\s+.*?\s+|.*?)(<\/strong>\s<\/td>)/ig)){
					company_name = (tmp_value.replace(/(<th>\s.*?<\/th>\s<td>\s<strong>)(\s+.*?|\s+.*?\s+|.*?)(<\/strong>\s<\/td>)/ig,'$2')).replace(/\s+|amp;|;/ig,' ').trim();
				}	
				if(tmp_value.match(/(<th>\sAdresse\s<\/th>\s<td>)(.*?)(<\/td>)/ig)){
					address = (tmp_value.replace(/(<th>\sAdresse\s<\/th>\s<td>)(.*?)(<\/td>)/ig,'$2')).replace(/<br>/,'').trim();
				}
				if(tmp_value.match(/(<th>\sTéléphone\s<\/th>\s<td>)(.*?)(<\/td>)/ig)){
					phone = tmp_value.replace(/(<th>\sTéléphone\s<\/th>\s<td>)(.*?)(<\/td>)/ig,'$2').trim();
				}
				if(tmp_value.match(/(<th>\sFax\s<\/th>\s<td>)(.*?)(<\/td>)/ig)){
					fax = tmp_value.replace(/(<th>\sFax\s<\/th>\s<td>)(.*?)(<\/td>)/ig,'$2').trim();
				}
				if(tmp_value.match(/(<th>E-mail<\/th><td>\s+<a href="(.*?)>)(.*?|.*?\s+)(<\/a><\/td>)/ig)){
					email = tmp_value.replace(/(<th>E-mail<\/th><td>\s+<a href="(.*?)>)(.*?|.*?\s+)(<\/a><\/td>)/ig,'$3').trim();
				}
			}

			if(this.exists('#Main_Main_Lnormale>td:nth-of-type(1) a')){
				value_quali = 'http://www.qualibat.com'+this.getElementAttribute('#Main_Main_Lnormale>td:nth-of-type(1) a','href');
				this.then(function(){
					this.download(value_quali,'pdf/'+(j+1)+'_'+company_name+'_quali.pdf');
				});	
			}
			if(this.exists('#Main_Main_TableCell6 a')){
				value_rge = 'http://www.qualibat.com'+this.getElementAttribute('#Main_Main_TableCell6 a','href');
				this.then(function(){
					this.download(value_rge,'pdf/'+(j+1)+'_'+company_name+'_rge.pdf');
				});	
			}
		});
		this.then(function(){
			//this.echo(company_name);
			this.echo('\n==== Product Detail :'+company_name+'===>'+(j+1)+' of '+listarray.length);
			data_file = company_name+';'+address+';'+phone+';'+fax+';'+email+';'+value_quali+';'+value_rge+'\n';
			fs.write('get_detail.csv',data_file,'a');
		});				
	});
}

casper.run(function(){
	this.echo('completed.');
	this.exit();

});