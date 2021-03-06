
$(document).ready(function () {
    /*得到所有的hotjob*/
    $.get('/hotjob',function (hotjobs) {
        function islike(id) {
            if (hotjobs.some(function (job) {
                    return job.id === id;
                })) {
                return true;
            } else {
                return false;
            }
        }

        $.post('/searchjobs',{jobtype:'',category:'',jobname:''},function (jobs) {
            let result='';
            for(let i=0;i<jobs.length;i++){
                if(islike(jobs[i].id)){
                    result+=`<tr style="background-color: #F37B34">`
                }else {
                    result+=`<tr>`;
                }
                result+=`
                <td width="20"><input type="checkbox" name="" value=""></td>
				<td width="70">${jobs[i].id}</td>
				<td width="120">${jobs[i].userId}</td>
				<td>${jobs[i].title}</td>
				<td width="100">${jobs[i].status?'已审核':'未审核'}</td>
 				<td width="100" style="text-align: center;">
 				    <a  title="编辑" onclick="admin_job_checked(this,${jobs[i].id})" class="ml-5" style="text-decoration:none">
 				        <i class="Hui-iconfont">&#xe6df;</i>
 				    </a> 
 				    <a href="/jobInfo.html?id=${jobs[i].id}" title="查看" onclick="" class="ml-5" style="text-decoration:none">
 				        <i class="Hui-iconfont">&#xe725;</i>
 				    </a> 
 				    <a title="删除" onclick="admin_job_del(this,${jobs[i].id})" class="ml-5" style="text-decoration:none">
 				        <i class="Hui-iconfont">&#xe6e2;</i>
 				    </a>
 				    <a title="添加热门" onclick="admin_hotjob_add(this,${jobs[i].id})" class="ml-5" style="text-decoration:none">
 				        <i class="Hui-iconfont">&#xe61b;</i>
 				    </a>
 				</td>
            </tr>   `
            }
            $("#sum").html(jobs.length);
            if(result.length===0){
                $('tbody').append("<tr><td colspan='9'>暂无任何记录!</td></tr>");
            }
            $('tbody').empty().append(result);
            changeback();
        });
    });
});

/*改变未审核的工作的背后颜色*/
function changeback(){
    $('tbody tr').each(function (i) {
        let a=$($(this).find('td').get(4)).text();
        if(a.indexOf('未审核')!==-1){
            $(this).attr("style", "BACKGROUND-COLOR: #fe0d0d");
        }
    });
}

/***删除选中的工作**/
function delchosen() {
    let jobsid=[];
    if($($('tr').get(2)).text().indexOf('记录')===-1){
        $('tbody tr').each(function (i) {
            let b=$(this).find(':checkbox').get(0).checked;
            let a=$($(this).find('td').get(1)).text();
            if(b){
                jobsid.push(a);
            }
        });
    }
    if (jobsid.length===0){
        layer.msg('未选中任何记录!', {icon: 2, time: 1000});
    }else {
        layer.confirm('确认要删除此职位吗？', function (index) {
            $.ajax({
                type: 'post',
                url: '/deletejobs',
                dataType: 'json',
                data: {jobsid: jobsid},
                success: function (data) {
                    $("#sum").html($('tbody tr').length - jobsid.length);
                    $('tbody tr').each(function (i) {
                        let b = $(this).find(':checkbox').get(0).checked;
                        if (b) {
                            $(this).remove();
                        }
                    });
                    if($('tbody tr').length===0){
                        $('tbody').append("<tr><td colspan='9'>暂无任何记录!</td></tr>");
                    }
                    layer.msg('已删除!', {icon: 1, time: 1000});
                },
                error: function (data) {
                    console.log(data.msg);
                },
            });
        });
    }
}

/*删除此工作*/
function admin_job_del(obj,id) {
    layer.confirm('工作删除须谨慎，确认要删除吗？',function(index) {
        $.ajax({
            type: 'post',
            url: '/deletejobs',
            dataType: 'json',
            data: {jobsid:[id]},
            success: function (data) {
                $("#sum").html($('tbody tr').length-1);
                $(obj).parents("tr").remove();
                if($('tbody tr').length===0){
                    $('tbody').append("<tr><td colspan='9'>暂无任何记录!</td></tr>");
                }
                layer.msg('已删除!', {icon: 1, time: 1000});
            },
            error: function (data) {
                console.log(data.msg);
            },
        });
    });
}

//**添加热门职业***//
function admin_hotjob_add(obj,id) {
    let color=$($(obj).parents('tr')).css('background-color');
    if(color!=='rgb(243, 123, 52)'){
        layer.confirm('确定添加此职位为热门吗？',function(index) {
            $.ajax({
                type: 'post',
                url: '/addhotjobs',
                dataType: 'json',
                data: {jobsid:[id]},
                success: function (data) {
                    console.log(data);
                    /*添加职位通过*/
                    if(data){
                        layer.msg('已添加!', {icon: 1, time: 1000});
                        $(obj).parents('tr').attr("style", "BACKGROUND-COLOR: #F37B34");
                    }else{
                        layer.msg('此职位未审核!', {icon: 2, time: 1000});
                    }
                },
                error: function (data) {
                    console.log(data);
                },
            });
        });
    }
    else{
        layer.msg('此职位已是热门职位!', {icon: 2, time: 1000});
    }
};

/*一键审核选中的数据*/
function checkchosen() {
    let jobsid=[];
    if($($('tr').get(2)).text().indexOf('记录')===-1){
        $('tbody tr').each(function (i) {
            let b=$(this).find(':checkbox').get(0).checked;
            let a=$($(this).find('td').get(1)).text();
            let c=$($(this).find('td').get(4)).text();
            if(b&&c.indexOf('未审核')!==-1){
                jobsid.push(a);
            }
        });
    }
    if(jobsid.length!==0){
        layer.confirm('确认完成此职位的审核吗？',function(index) {
            $.ajax({
                type: 'post',
                url: '/jobstochecked',
                dataType: 'json',
                data: {jobsid:jobsid},
                success: function (data) {
                        $('tbody tr').each(function (i) {
                            let b=$(this).find(':checkbox').get(0).checked;
                            let c=$($(this).find('td').get(4)).text();
                            if(b&&c.indexOf('未审核')!==-1){
                                $(this).attr("style", "BACKGROUND-COLOR: white");
                                $($(this).find('td').get(4)).text('已审核');
                            }
                        });
                        layer.msg('审核成功!', {icon: 1, time: 1000});
                },
                error: function (data) {
                    console.log(data.msg);
                },
            });
        });
    }else{
        layer.msg('未选中未审核任何记录!', {icon: 2, time: 1000});
    }
}

/*审核单个工作*/
function admin_job_checked(obj,id){
    let a=$($(obj).parents('tr').find('td').get(4)).text();
    if(a.indexOf('未审核')!==-1){
        layer.confirm('确认完成此职位的审核吗？',function(index) {
            $.ajax({
                type: 'post',
                url: '/jobstochecked',
                dataType: 'json',
                data: {jobsid: [id]},
                success: function (data) {
                    $(obj).parents('tr').attr("style", "BACKGROUND-COLOR: white");
                    $($(obj).parents('tr').find('td').get(4)).text('已审核');
                    layer.msg('审核已通过！', {icon: 1, time: 1000});
                },
                error: function (data) {
                    console.log(data.msg);
                },
            });
        });
    }else{
        layer.msg('该职位已通过审核！', {icon: 2, time: 1000});
    }
}