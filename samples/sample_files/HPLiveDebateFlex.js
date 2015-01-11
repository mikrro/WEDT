(function (factory) {
if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    require.config({"paths":{"jquery.jsonp":"/jquery.jsonp-2.4.0.min.js?v=1.1",}});
    var curried_factory = function(jquery, _, jqueryjsonp){ factory(jquery, _, window.NYTD); }
    require(['foundation/main'], function(Foundation) {
      require(['jquery/nyt', 'underscore/nyt', 'jquery.jsonp'], curried_factory );
    });

} else {
    // Browser globals
    factory(NYTD.jQuery, (window._) ? window._ : window.Underscore, window.NYTINT);

}
})(function (jQuery, _, NS, b) {
    NS = NS || {};
    if (NS.HPLiveUpdatesStarted == true){
      return false;
    }
    if (NS !== b && NS.HPLiveDebateFlex === b) {
        //register callbacks for dashboards.
        NYTD.NYTINT = window.NYTINT || {};
        NYTD.NYTINT.Stream = NYTD.NYTINT.Stream || {};
        NYTD.NYTINT.Stream.AllStreams = {
            "live-debate": {
                _parse: function (e) {
                    //not supported in this variation
                }
            },
            "nytint-dashboard": {
                _parse: function (e, h) {

                    // if there's only one dashboard-style feed,
                    // we don't need hack-y methods to match feeds up with their modules
                    // and we therefore won't need the slug to be set.g
                    if (  _(NS.HPLiveDebateFlex.flextypes).keys().length < 2  ){
                        var slug = _.keys(NS.HPLiveDebateFlex.flextypes)[0];
                    }else{
                        var slug = e.latest_options.slug;
                    }

                    NS.HPLiveDebateFlex.flextypes[slug].onDataLoad(e);

                }
            }
        };



        NS.HPLiveDebateFlex = function (flex_container_obj, flextype_data) { //was e, d, f
            this.init(flex_container_obj, flextype_data);
        };
        NS.HPLiveDebateFlex.flextypes = [];
        NS.HPLiveDebateFlex.loading = 0;
        NS.HPLiveDebateFlex.busy = false;

        NS.HPLiveDebateFlex.prototype = {
            init: function (flex_container_obj, flextype_data){
                var self = this,
                    tabs, does_latest_updates_tab_exist = false;
                if(NYTD && NYTD.NYTMM){
                    NYTD.NYTMM.debugLevel = 0;
                }

                /* Options */
                this.default_options = {
                    feed_type: true, //gets converted to be "dashboard"; false => "liveblog"
                    src: "",
                    limit: 6, //number of headlines to show
                    auto_refresh: true, //shouldn't ever be false.
                    refresh_time: 30,
                    module_height: 200,
                    module_min_height: 200,

                    show_view_all_updates: true,
                    show_timestamps: true,
                    show_timestamp_timezones: true,

                    show_overall_summary: false,
                    overall_summary_text: '',

                    container_class: '', //e.g. red-theme

                    hed_text: 'Updates', //customizable text for the headline
                    hed_text_long: 'Updates On The Latest News',
                    hed_link: 'http://nytimes.com', //where the headline's link should point
                    label_text: 'Live', // string, e.g. 'live', 'latest'
                    label_theme: 'red', // 'red' | 'white', default: 'red'

                    show_scroller: false,

                    ipad_app_links: false,
                    ipad_url: ""
                };
                this.headlines_list = [{ // the variable formerly known as "tab"
                    id: "latest_updates",
                    title: "Latest Updates",
                }];

                this.options = _.extend(this.default_options, flextype_data.options);

                // if refresh_time is set to zero, refresh once per 5 minutes.
                if(this.options.refresh_time < 1){
                    this.options.refresh_time = 300;
                }
                if(this.options.feed_type == true){
                    this.options.feed_type = "dashboard";
                }else if(this.options.feed_type == false){
                    this.options.feed_type = "liveblog";
                }

                this.data_loading = false;
                this.started = false;


                /* Templates */

                var list_template = ['<li>',
                                    '<div class="nytmm_timestamp timestamp"></div><a href="#"></a>',
                                    '</li>'].join('');
                var tabcontent_template = ['<div class="nytmm_tabcontent">',
                                            '<div class="nytmm_buttons">',
                                            '<div class="nytmm_button_down"></div><div class="nytmm_button_up"></div>',
                                            '</div>',
                                            '<div class="nytmm_headlines">',
                                            '<ul class="nytmm_headline_list"></ul>',
                                            '</div>',
                                            '<p class="nytmm_morelink"></p>',
                                            '</div>'].join('');
                var container_template = ['<div class="nytmm_hplivedebateflex overhauled-live-updates-container">',
                                                '<p class="nytmm_hplivedebateflex_summary"></p>',
                                                '<div class="nytmm_hplivedebateflex_tabs"></div>',
                                                '<div class="nytmm_hplivedebateflex_tabcontent"></div>',
                                             '</div>'].join('');

                var topper_template = ['<div class="story">',
                                            '<div class="overhauled-live-updates-banner">',
                                                '<h5>',
                                                '<strong class="label"></strong>',
                                                    '<a href="" class="short"></a>',
                                                    '<a href="" class="full"></a>',
                                                '</h5>',
                                            '</div>',
                                        '</div>'].join('');

                var styles = ['<style>',
                            /* default styles for article page */
                            ".overhauled-live-updates-banner {",
                            "  overflow: hidden;",
                            "  margin: 0 0 5px 0;",
                            "}",
                            ".overhauled-live-updates-banner h5{",
                            "  margin-bottom: 0px;",
                            "  margin-top: 0px;",
                            "  font: 500 16px/18px 'nyt-cheltenham', Georgia, serif;",
                            "  color: #000",
                            "}",
                            ".overhauled-live-updates-banner .label,",
                            ".overhauled-live-updates-banner a {",
                            "  font: normal 800 11px/20px 'nyt-franklin', arial, helvetica, sans-serif; }",
                            ".overhauled-live-updates-banner .label {",
                            "  float: left;",
                            "  display: inline-block;",
                            "  margin: 0 8px 5px 0;",
                            "  padding: 5px 8px 4px 8px;",
                            "  text-transform: uppercase;",
                            "  font-size: 10px;",
                            "  line-height: 12px;",
                            "  letter-spacing: .05em;",
                            "  font-weight: normal;",
                            "  color: white;",
                            "  background: #A81817;",
                            "}",
                            ".overhauled-live-updates-banner .label.red { /* quote-unquote themes for the live/latest label */",
                            "  color: #fff;",
                            "  background: #a81817;",
                            "}",
                            ".overhauled-live-updates-banner .label.white{",
                            "  color: #a81817;",
                            "  background: #eee;",
                            "}",
                            ".nytmm_hplivedebateflex_summary{",
                            "  margin: 0 0px 5px 0;",
                            "  padding-left: 8px;",
                            "  font: normal 800 11px 'nyt-franklin', arial, helvetica, sans-serif; }",
                            "}",
                            ".overhauled-live-updates-banner ul{",
                            "  list-style-type: none;",
                            "}",
                            ".overhauled-live-updates-banner a {",
                            "  font-size: 14px;",
                            "}",
                            ".overhauled-live-updates-banner a{",
                            "  color: 004276;",
                            "  text-decoration: none;",
                            "}",
                            ".overhauled-live-updates-banner a:hover{",
                            "  text-decoration: underline;",
                            "}",
                            ".overhauled-live-updates-banner.live a {",
                            "  color: #000;",
                            "}",
                            ".overhauled-live-updates-banner a.short {",
                            "  display: none;",
                            "}",
                            ".overhauled-live-updates-banner p {",
                            "  display: none;",
                            "  margin: 10px 0 0 0;",
                            "  color: #666;",
                            "}",

                            ".overhauled-live-updates-banner.latest p {",
                            "  display: block;",
                            "}",

                            ".overhauled-live-updates-container ul{",
                            "  list-style-type: none;",
                            "  padding: 0;",
                            "  margin: 0;",
                            "  height: auto !important;",
                            "}",
                            ".overhauled-live-updates-container li{",
                            "  font-family: arial,helvetica,sans-serif;",
                            "  background: none;",
                            "  padding: 0 2px 6px 0;",
                            "  -webkit-text-size-adjust: none !important;",
                            "  clear: both;",
                            "  margin-bottom: 8px;",
                            "  padding: 0;",
                            "  font-family: 'nyt-franklin',arial,helvetica,sans-serif;",
                            "  font-size: 14px;",
                            "  line-height: 17px;",
                            "  font-weight: 300;",
                            "}",
                            ".overhauled-live-updates-container li:before,",
                            ".overhauled-live-updates-container li:after {",
                            "  clear: both;",
                            "  display: table;",
                            "  content: '';",
                            "  line-height: 0;",
                            "}",
                            ".overhauled-live-updates-container a{",
                            "  text-decoration: none;",
                            "  font: 300 14px/17px 'nyt-cheltenham', Georgia, serif;",
                            "  color: #326891;",

                            "  display: block;",
                            "  float: right;",
                            "  width: 77%;",
                            "  font-family: 'nyt-franklin',arial,helvetica,sans-serif;",
                            "  font-size: 14px;",
                            "  line-height: 17px;",
                            "  font-weight: 300;",
                            "}",
                            ".overhauled-live-updates-container a:hover{",
                            "  text-decoration: underline;",
                            "}",
                            ".overhauled-live-updates-banner a:visited{",
                            "  color: #000",
                            "}",
                            ".overhauled-live-updates-container a:visited{",
                            "  color: #326891;",
                            "}",
                            ".overhauled-live-updates-container .timestamp{",
                            "  display: inline-block;",
                            "  padding-right: 5px;",
                            "  font-size: 10px;",
                            "  font-size: .625rem;",
                            "  line-height: 17px;",
                            "  line-height: 1.0625rem;",
                            "  font-weight: 400;",
                            "  font-family: 'nyt-franklin',arial,helvetica,sans-serif;",
                            "  color: #999;",
                            "  white-space: nowrap;",
                            "  -webkit-text-size-adjust: none !important;",
                            "}",

                            /* shared homepage/article styles for distinguishing small and large-sized modules */
                            /* small modules */
                                ".wide-b-layout .a-column .overhauled-live-updates-banner a.short,", 
                                ".nythpSplitCode .column .overhauled-live-updates-banner a.short,", //split b col
                                ".wide-a-layout .b-column .overhauled-live-updates-banner a.short{",
                                "  display: inline;",
                                "  font-size: 12px;",
                                "  line-height: 14px;",
                                "}",
                                ".wide-b-layout .a-column .overhauled-live-updates-banner a.full,",
                                ".nythpSplitCode .column .overhauled-live-updates-banner a.full,",
                                ".wide-a-layout .b-column .overhauled-live-updates-banner a.full{",
                                "  display: none;",
                                "  font-size: 12px;",
                                "  line-height: 14px;",
                                "}",
                                ".wide-b-layout .a-column .overhauled-live-updates-banner p,",
                                ".nythpSplitCode .column .overhauled-live-updates-banner p,",
                                ".wide-a-layout .b-column .overhauled-live-updates-banner p{",
                                "  margin-left: 10px;",
                                "}",
                                ".wide-b-layout .a-column .overhauled-live-updates-banner,",
                                ".nythpSplitCode .column .overhauled-live-updates-banner,",
                                ".wide-a-layout .b-column .overhauled-live-updates-banner{",
                                "  margin: 0;",
                                "}",

                            /* wide HP layouts */
                                ".wide-b-layout .b-column .overhauled-live-updates-container .nytmm_headline_list li{",
                                "  padding: 0;",
                                "  margin-bottom: 5px;",
                                "}",

                                /* bump up font size for b col, but not split b */
                                ".wide-b-layout .b-column .overhauled-live-updates-container .nytmm_headline_list li a{",
                                "  font-size: 12px;",
                                "  line-height: 14px;",
                                "}",
                                ".wide-b-layout .b-column .nythpSplitCode .column .overhauled-live-updates-container .nytmm_headline_list li a{",
                                "  font-size: 11px;",
                                "  line-height: 13px;",
                                "}",
                                
                                /* wide HP layouts, article page layout */
                                "figure.layout-small .overhauled-live-updates-container .timestamp,",
                                ".wide-b-layout .b-column .overhauled-live-updates-container .timestamp{",
                                "  float: left;",
                                "  width: 20%;",
                                "  line-height: 19px;",
                                "}",

                            /* homepage-only styles 
                                .domestic and .international distinguish the homepage from article pages.
                                Reed E. says we'll get proper app-specific classes sometime soonish.
                                I used to use .edition-domestic/.edition-international, but at some point
                                those started showing up on article pages too.
                            */                               
                                ".app-homepage .overhauled-live-updates-banner h5 a{",
                                  "font-family: georgia,'times new roman',times,serif;",
                                "}",                               
                                ".app-homepage .overhauled-live-updates-container li{",
                                "  margin-bottom: 5px;",
                                "  padding: 0;",
                                "  font-family: 'nyt-franklin',arial,helvetica,sans-serif;",
                                "  font-size: 11px;",
                                "  line-height: 13px;",
                                "  clear: none;",
                                "  font-weight: normal;",
                                "}",                               
                                ".app-homepage .overhauled-live-updates-banner a:visited{",
                                "  color: #000;",
                                "}",                               
                                ".app-homepage .overhauled-live-updates-container a{",
                                "  display: inline;",
                                "  float: none;",
                                "  width: 100%;",
                                "  font-family: nyt-franklin, arial, helvetica, sans-serif;",
                                "  font-size: 11px;",
                                "  font-weight: 500;",
                                "  line-height: 13px;",
                                "  color: #000",
                                "}",                               
                                ".app-homepage .overhauled-live-updates-container a:visited{",
                                  "color: #000",
                                "}",                               
                                ".app-homepage .overhauled-live-updates-container .timestamp{",
                                "  color: #a81817;",
                                "}",                               
                                ".app-homepage .wide-b-layout .b-column .overhauled-live-updates-container .timestamp{",
                                "  width: 59px;",
                                "  text-align: left;",
                                "  float: none;",
                                "}",
                                /* unsetting this before/after psuedo-selector business. */                                                              
                                ".app-homepage .overhauled-live-updates-container li:before,",
                                ".app-homepage .overhauled-live-updates-container li:after {",
                                "      clear: none;",
                                "      display: none;",
                                "      content: none;",
                                "      line-height: 0;",
                                "  }",
                '</style>'].join('');

                this.templates = {
                    list_template: jQuery(list_template),
                    tabcontent_template: jQuery(tabcontent_template),
                    container_template: jQuery(container_template),
                    topper_template: jQuery(topper_template),
                    styles: styles
                };

                /* Insert stuff into templates */
                if (this.options.show_overall_summary && (this.options.overall_summary_text.length > 0)){
                    this.templates.container_template.find('.nytmm_hplivedebateflex_summary').text(this.options.overall_summary_text);
                }else{
                    this.templates.container_template.find('.nytmm_hplivedebateflex_summary').remove();
                }
                if( this.options.container_class && this.options.container_class.length > 0 ){
                    this.templates.topper_template.addClass(this.options.container_class);
                    this.templates.container_template.addClass(this.options.container_class);
                }

                this.templates.topper_template.find('a.short').text(this.options.hed_text);
                this.templates.topper_template.find('a.full').text(this.options.hed_text_long);
                this.templates.topper_template.find('a.short').attr('href', this.options.hed_link);
                this.templates.topper_template.find('a.full').attr('href', this.options.hed_link);
                if(!!this.options.show_label){
                    this.templates.topper_template.find('strong.label').text(this.options.label_text).addClass(this.options.label_theme);
                }else{
                    this.templates.topper_template.find('strong.label').remove();
                }
                this.$flexcontainer = flex_container_obj; //jQuery("#" + flex_container_id);
                jQuery('head').append(this.templates.styles);
                this.$flexcontainer.empty();
                this.$flexcontainer.append(this.templates.topper_template);
                this.$flexcontainer.append(this.templates.container_template);

                if (!this.$flexcontainer.parent().hasClass("story")) {
                    this.$flexcontainer.css("marginBottom", "8px");
                }
                this.$container = this.$flexcontainer.find(".nytmm_hplivedebateflex");
                this.$container.addClass("nytmm_singlemode"); //since there are no tabs, ergo singlemode
                this.$tab = this.$container.find(".nytmm_hplivedebateflex_tabs");
                this.$tabcontent = this.$container.find(".nytmm_hplivedebateflex_tabcontent");
                this.test = this.$container;

                /* Ask to load data. */
                this.loadData();
            },

            loadData: function () {
                if (this.data_loading) {
                    return
                }
                this.data_loading = true;
                var fetchData = _.bind(function() {
                    if (this.options.feed_type == "dashboard") {
                        //callback handled above by NYTD.NYTINT.Stream.AllStreams... etc.
                        jQuery.ajax({
                            type: "GET",
                            url: this.options.src,
                            cache: false,
                            dataType: "script"
                        });
                    } else {
                        var flextype_callback = "liveBlogData";
                        jQuery.jsonp({
                            url: this.options.src,
                            cache: true,
                            callback: flextype_callback,
                            success: _.bind(function(feed_data){
                                this.onDataLoad(feed_data);
                            }, this)
                        });
                    }
                }, this);

                if (this.refresh_interval) {
                    clearInterval(this.refresh_interval);
                }
                // if the mutex says we can go ahead and load the data, do it.
                if (NS.HPLiveDebateFlex.busy === false) {
                    NS.HPLiveDebateFlex.busy = true; // but first set the mutex to busy.
                    fetchData();
                } else {
                    //otherwise, try again in .3 sec.
                    setTimeout(_.bind(function () {
                        fetchData();
                    }, this), 300);
                }
            },


            /* Functions above here are executed on init. */
        };

        NS.HPLiveUpdatesStarted = true;

        /* TODO: move this into the FFP, if possible. */
        jQuery(document).ready(function(){
            // var feeds = jQuery('.live_blog_feed'); // one of these is flextype_target
            var flextypes = NYTD.FlexTypes.filter(function(flextype){ return flextype.type.indexOf("HPLiveUpdate2") > -1}); // pasted onto the page from Scoop-land.
            // tripartite fork here:
            // 1. If there's more than one live updates module and 1+ is a dashboard, use the hack-y method.
            // 2. If there's only one dashboard involved and no other live updates modules, act like an old-style live updates module.
            // 3. If there are no dashboards involved, use the plugin-style.

            var dashboard_style_flextypes = _(flextypes).filter(function(flextype){ return flextype.data.options.feed_type; });

            _.each(flextypes, function (flextype, flextype_index) {
                var flextype_target = jQuery("#" + flextype.target); //target_divs.eq(flextype_index);
                var flextype_data = flextype.data;

                //convert the boolean from Scoop into the string options that the rest of the script expects
                if(flextype_data.options.feed_type){
                    flextype_data.options.feed_type = "dashboard";
                }else{
                    flextype_data.options.feed_type = "liveblog";
                }


                if ( dashboard_style_flextypes.length > 0 ){
                    var slug = flextype_data.options.src_slug;

                    var flextype_obj = new NS.HPLiveDebateFlex(flextype_target, flextype_data);

                    if (flextype_data.options.feed_type == "dashboard") {
                        NS.HPLiveDebateFlex.flextypes[slug] = flextype_obj;
                    }
                }else{
                    var flextype_obj = new NS.HPLiveDebateFlex(flextype_target, flextype_data);
                }
            });
            return false;
        });

        /*
           Functions below here are executed once the JSONP is loaded
           and the callback (the NYTD.NYTINT.Stream.AllStreams["nytint-dashboard"]._parse method)
           calls onDataLoad.

           (they're only separated here for clarity's sake.)
        */
        NS.HPLiveDebateFlex.prototype = _.extend(NS.HPLiveDebateFlex.prototype, {
            onDataLoad: function (feed_data) {
                var e = [],
                    self = this;
                this.data_loading = false;
                NS.HPLiveDebateFlex.busy = false;
                this.feed = feed_data;
                // yes this is redundant. but it's broken otherwise.
                // this.$container = this.$flexcontainer.find(".nytmm_hplivedebateflex");
                // this.$container.addClass("nytmm_singlemode"); //since there are no tabs, ergo singlemode
                // this.$tab = this.$container.find(".nytmm_hplivedebateflex_tabs");
                // this.$tabcontent = this.$container.find(".nytmm_hplivedebateflex_tabcontent");
                // console.log("down here", jQuery.contains(document, this.$container[0]))

                if (this.options.feed_type == "dashboard"){
                    var items = feed_data.items.filter(function(item){ return item.type == "live_blog" });
                }else{
                    if( feed_data.hasOwnProperty('updates') ){
                        this.options.feed_type = "liveblog";
                        var items = feed_data.updates;
                    }else{
                        this.options.feed_type = "dashblog";

                        var items = _(feed_data).values().map(function(item){
                            var utcTime = Date.parse(item.time.replace(" ", "T") + "Z"); //pretend the E(S/D)T input is UTC (even though it's not)
                            var easternTime = utcTime + new Date(utcTime).getTimezoneOffset() * 60000; // then add back the E(S/D)T offset (converted to milliseconds)
                            item.created = easternTime / 1000;
                            return item;
                        });
                    }
                }

                _.each(items, _.bind(function (item, i) {
                    item.formatted_time = this.formatTime(item.created);
                    if(this.options.feed_type == "dashboard"){
                        item.link = this.replaceipadURL(item.long_url);
                    }else if (this.options.feed_type == "liveblog"){
                        item.formatted_time = item.time.split(".").join(""); // "created" here is incorrect. ugh.
                        item.link = this.replaceipadURL(feed_data.post.permalink + "#" + item.permalink);
                    }else if (this.options.feed_type == "dashblog"){
                        item.link = item.permalink;
                    }
                },this));

                var headlines_list = this.headlines_list;

                headlines_list.items = items;

                headlines_list.items = sort_by_descending_date(headlines_list.items);

                if (_.size(headlines_list.items) > headlines_list.data_length) {
                    headlines_list.updated = true;
                    headlines_list.data_length = _.size(headlines_list.items);
                } else {
                    headlines_list.updated = false;
                }

                if (!this.started) {
                    this.source_url = items[0].link.split("#")[0];
                    this.renderContainers();
                } else {
                    this.renderLists();
                }

                function sort_by_descending_date(j) {
                    var i = _(j).chain().sortBy(function (k) {
                        return k.created;
                    }).reverse().value();
                    return i;
                }
            },

            /* A grab bag of internal helper functions.  */
            startInterval: function () {
                var self = this;
                if (this.options.auto_refresh) {
                    this.refresh_interval = setInterval(function () {
                        self.loadData();
                    }, self.options.refresh_time * 1000);
                }
            },
            replaceipadURL: function (url) {
                var dirty_url = (this.options.ipad_app_links && this.options.ipad_url !== "") ? url.replace("http://", this.options.ipad_url) : url;
                dirty_url = dirty_url.replace(/\s/g, "");
                return dirty_url;
            },

            formatTime: function (d) {
                var e, k, g, l, f, j, i, h;
                e = new Date(d * 1000);
                k = e.getHours();
                g = e.getMinutes();
                l = e.getSeconds();
                f = (k > 12) ? k - 12 : ((k === 0) ? 12 : k);
                j = (k < 12) ? " AM" : " PM";
                i = (g < 10) ? "0" + g.toString() : g;
                h = f + ":" + i + j;
                return h
            },


            /* A grab bag of helper functions for rendering/display stuff */
            renderContainers: function () {
                var self = this;

                var morelink;
                if (self.options.show_view_all_updates) {
                    morelink = '<a href="' + self.source_url + '">More Updates &#187;</a>'
                }else{
                    morelink = false;
                }
                var container = this.templates.tabcontent_template.clone();
                if(morelink){
                    container.find('p.nytmm_morelink').html(morelink);
                }else{
                    container.find('p.nytmm_morelink').remove();
                }
                if(!this.options.show_scroller){
                    container.find('.nytmm_buttons').remove();
                }
                this.$tabcontent.append(container);
                this.renderLists();

            },

            renderLists: function () {
                var tab = this.headlines_list;
                var tab_index = 0;

                var $tab_content = this.$tabcontent.find(".nytmm_tabcontent").eq(tab_index),
                    $list_template = $tab_content.find(".nytmm_headline_list"),
                    items_to_show = [];

                if (tab.updated || !this.started) {
                    var items_to_show = _.first(tab.items, this.options.limit);
                    _(items_to_show).each(_.bind(function(item, idx){
                        var stamp = this.templates.list_template.clone();
                        if(this.options.show_timestamps){
                            var timestamp_text = item.formatted_time + (this.options.show_timestamp_timezones ? " ET" : "");
                            stamp.find('.nytmm_timestamp').text(timestamp_text);
                        }else{
                            stamp.find('.nytmm_timestamp').remove();
                        }
                        stamp.find('a').attr('href', item.link);
                        stamp.find('a').html(item.title);
                        $list_template.append(stamp);
                    }, this));

                    $list_template.hide().fadeIn(900);
                    if (!$tab_content.hasClass("nytmm_selected")) {
                        $tab_content.addClass("nytmm_selected");
                    }
                }

                this.$tab.find("li").css("cursor", "default");
                if (this.options.module_height === 0) {
                    this.setHeights();
                }
                if (this.options.module_height > 0) {
                    this.trimList();
                }
                this.startInterval();
                this.started = true;
            },
            setHeights: function () {
                var max_tab_height = 0;
                this.$tabcontent.find(".nytmm_tabcontent").each(function () {
                    $tab = jQuery(this);
                    if ($tab.height() > max_tab_height) {
                        max_tab_height = $tab.height();
                    }
                }).css({
                    "min-height": max_tab_height
                });
                if (jQuery.browser.msie && jQuery.browser.version == 6) {
                    this.$content.find(".nytmm_tabcontent").css({
                        height: max_tab_height
                    });
                }
            },
            trimList: function () {
                var list_height = this.options.module_height - this.$tab.outerHeight() - 2;
                var morelink = this.$tab.find(".nytmm_morelink"),
                    headlines = this.$tab.find(".nytmm_headlines"),
                    morelink_height = morelink.length > 0 ? morelink.outerHeight() + parseInt(morelink.css("margin-top"), 10) : 0,
                    paddings = parseInt(headlines.css("padding-top") || 0, 10) + parseInt(headlines.css("padding-bottom") || 0, 10) + 2,
                    headlines_height = list_height - morelink_height - paddings;
                headlines.height(headlines_height);
                var headline_list = headlines.find(".nytmm_headline_list");
                var headline_list_lis = headline_list.find("li");
                headline_list_lis.css("display", "none");
                var already_too_big = false;
                var m = this;
                headline_list_lis.each(function () {
                    var $li = jQuery(this);
                    $li.css("display", "list-item");
                    if (headline_list.outerHeight(true) > headlines_height) {
                        already_too_big = true;
                    }
                    if (already_too_big === true) {
                        $li.css("display", "none");
                    }
                });
                headlines.height(headline_list.outerHeight(true));
            }
        });
    }
});
