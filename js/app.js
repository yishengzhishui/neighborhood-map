var map;

function init() {
    // initial
    map = new BMap.Map('map');
    var point = new BMap.Point(120.545532,31.282485); //this is my company address
    map.centerAndZoom(point, 17);
    map.enableScrollWheelZoom();
    ko.applyBindings(new ViewModel());
}

var locations = [
  {
    "title": "悠方",
    "lng": 120.536033,
    "lat": 31.278753,
    "id": "79ba02c355284560d13ce3a4"
},


{
    "title": "苏州外国语学校",
    "lng": 120.54982,
    "lat": 31.282744,
    "id": "ffd6d40359d65b8f17b54b7f"
},

{
    "title": "浙建.枫华广场",
    "lng": 120.537563,
    "lat": 31.27631,
    "id": "1e0940c1052309b41e1d11a6"

},

{
    "title": "明基医院",
    "lng": 120.559421,
    "lat": 31.285052,
    "id": "e170599581af68a81c3894fc"
},

{
    "title": "苏州吴中(木渎)创业园",
    "lng": 120.543179,
    "lat": 31.272663,
    "id": "dfc496b6532bacd28936ee1f"
},

{
    "title": "新升新苑",
    "lng": 120.546222,
    "lat": 31.286909,
    "id": "50fb64ff2481cc5de9f85340"
},
{
    "title": "华润万家",
    "lng": 120.537294,
    "lat": 31.280795,
    "id": "d5f93c0e3fa7805ceddfca42"
},
];

// place function
var Place = function(data) {
    this.title = ko.observable(data.title);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
    this.id = ko.observable(data.id);
    this.marker = ko.observable();
    this.address = ko.observable('');
    this.picId = ko.observable('');
    this.tag = ko.observable('');
};

// ViewModel
var ViewModel = function() {

    // 绑定this
    var self = this;
    var marker;

    // 生成地点列表数组
    self.placeList = ko.observableArray();
    locations.forEach(function(location) {
        self.placeList.push(new Place(location));
    });

    // 生成地图上的小窗口
    var infoWindow = new BMap.InfoWindow("", {
        height: 200
    });

    // 给每个地点标记设定小窗口
    self.placeList().forEach(function(place) {

        // 初始化地图标记
        marker = new BMap.Marker(new BMap.Point(place.lng(), place.lat()));
        place.marker(marker);
        map.addOverlay(place.marker());

        // 使用百度Place API 获取地点详情
        var ajaxUrl = "http://api.map.baidu.com/place/v2/detail?uid=" + place.id() + "&output=json&scope=2&ak=vZ1r7NdTecAldnLi0cBV8TCFb3GTXKRR";
        $.ajax({
            url: ajaxUrl,
            type: "GET",
            dataType: "JSONP"
        }).done(function(data) {
            // 判断获取数据状态
            if (data.status === 0) {
                // 获取地址
                var address = '地址：' + data.result.address;
                place.address(address);
                // 获取图片id（如果有）
                var picId = data.result.hasOwnProperty('street_id') ? data.result.street_id : '';
                place.picId(picId);

                if (data.result.hasOwnProperty('detail_info')) {
                    // 获取标签
                    var tag = data.result.detail_info.hasOwnProperty('tag') ? '标签：' + data.result.detail_info.tag : '';
                    place.tag(tag);

                }
                // 设定小窗口内容
                var content = '<h4>' + place.title() + '<h4>' +
                    '<img alt="街景图" src="http://api.map.baidu.com/panorama/v2?ak=vZ1r7NdTecAldnLi0cBV8TCFb3GTXKRR&width=110&height=55&poiid=' + place.picId() + '">' +
                    '<p>' + place.address() + '</p>' +
                    '<p>' + place.tag() + '</p>' ;

            } else {
                var content = '<h4>数据获取失败<h4>';
            }

            // 使用百度EventWrapper开源库来使得地图上的标记可以点击
            BMapLib.EventWrapper.addListener(place.marker(), "click", function(e) {
                e.target.openInfoWindow(infoWindow);
                // 设定动画效果
                e.target.setAnimation(BMAP_ANIMATION_BOUNCE);
                setTimeout(function() {
                    e.target.setAnimation(null);
                }, 500);

                infoWindow.setContent(content);
                // 当点击标记时，地图中心会移至标记处
                map.panTo(e.target.getPosition());
            })

        }).fail(function() {
            alert("数据获取失败");
        });
    });

    // 给列表项的点击事件与地图标记的点击事件进行绑定
    self.showInfo = function(place) {
        var sdm = place.marker();
        BMapLib.EventWrapper.trigger(sdm, 'click', {
            'type': 'onclick',
            target: sdm
        });
    };

//Filter
    self.filteredList = ko.observableArray();

    self.placeList().forEach(function(place) {
        self.filteredList.push(place);
    });

    self.keyword = ko.observable('');

    self.filter = function() {
        self.filteredList([]);
        map.clearOverlays();

        var filterKeyword = self.keyword();
        var list = self.placeList();

        list.forEach(function(place) {
            if (place.title().indexOf(filterKeyword) != -1) {
                self.filteredList.push(place);
                map.addOverlay(place.marker());
            }
        });
    };

};
