/* jshint loopfunc: true */
(function() {
    var tests = {};
    window.testsuite = function(category, feature, testfn, description, visibility) {
        tests[category] = tests[category] || [];
        var currentPlatform = detectPlatform();
        
        if(description == null || description == undefined) { description = ''; }
        if(visibility == null || visibility == undefined) {
            visibility = {};
            visibility[currentPlatform] = 'VISIBLE';
        }
        
        tests[category].push({
            feature: feature,
            testfn: testfn,
            description: description,
            visibility: visibility[currentPlatform]
        });
    };
    var TEST_TIMEOUT = 20000;

    function detectPlatform() {
        var platform = 'sectv-tizen';
        if(navigator.userAgent.match('Web0S')) { platform = 'tv-webos' }
        
        return platform;
    }
    
    function createElem(tagName, attributes, children) {
        var elem = document.createElement(tagName);
        for(var attr in attributes) {
            if(attr === 'className') {
                elem.setAttribute('class', attributes[attr]);
            }
            else {
                elem.setAttribute(attr, attributes[attr]);
            }
        }
        if(typeof children === 'string') {
            elem.appendChild(document.createTextNode(children));
        }
        else {
            for(var i=0; children && i<children.length; i++) {
                elem.appendChild(children[i]);
            }
        }
        return elem;
    }

    var tester = {};
    function renderTests() {
        var count = 0;
        document.body.appendChild(createElem('h1', {}, 'Cordova TOAST TestSuite'));
        var container = createElem('div', {className: 'container'});
        document.body.appendChild(container);
        for (var category in tests) {
            for (var i = 0; i < tests[category].length; i++) {
                if(tests[category][i].visibility === 'INVISIBLE') continue;
                var testerId = count++;
                var fields = [];
                fields.push(createElem('div', {className: 'col-lg-1'}, category));
                fields.push(createElem('div', {className: 'col-lg-2'}, [
                    createElem('button', {className: 'btn btn-default', testerId: testerId}, tests[category][i].feature),
                    createElem('div', {className: 'badge'}, tests[category][i].description)
                ]));
                var reporter = createElem('div', {className: 'panel panel-info reporter col-lg-8 reporter'+testerId});
                fields.push(reporter);

                var row = createElem('div', {className: 'row'}, fields);
                container.appendChild(row);

                tester[testerId] = tests[category][i].testfn;
            }
        }

        document.body.addEventListener('click', function (e) {
            if(e.target.tagName.toUpperCase() === 'BUTTON' && e.target.getAttribute('testerId') !== null) {
                var testerId = parseInt(e.target.getAttribute('testerId'));
                if(typeof tester[testerId] === 'function') {
                    var testfn = tester[testerId];
                    var report = function (msg) {
                        tmrTest && clearTimeout(tmrTest);
                        setReportHTML(msg);
                    };
                    report.append = function (el) {
                        document.querySelector('.reporter'+testerId).appendChild(el);
                    };

                    var setReportHTML = function (msg) {
                        document.querySelector('.reporter'+testerId).innerHTML = '[' + Date.now() + ']' + msg;
                    };

                    setReportHTML('wait...');
                    try {
                        var tmrTest = setTimeout(function() {
                            tmrTest = null;
                            setReportHTML('TIMEOUT');
                        }, TEST_TIMEOUT);
                        testfn(report);
                    }
                    catch (e) {
                        setReportHTML('Exception: ' + e);
                    }
                }
            }
        });
    }
    
    var type = localStorage.getItem('CORDOVA_TOAST_TESTRUNNER_TYPE');
    if (type !== 'TESTSUITE') {
        return;
    }
    document.addEventListener('deviceready', function() {
        renderTests();
    });
})();
