'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactBootstrap = require('react-bootstrap');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Tariff = function (_Component) {
    _inherits(Tariff, _Component);

    function Tariff(props) {
        _classCallCheck(this, Tariff);

        var _this2 = _possibleConstructorReturn(this, (Tariff.__proto__ || Object.getPrototypeOf(Tariff)).call(this, props));

        _this2.state = {
            status: 0,
            paynds: 0,
            paymark: 0,
            cover: 0,
            service: "",
            pay: 0,
            valnds: 0,
            needed_attrs: ['weight', 'index_from', 'index_to', 'type', 'service'],
            success: false,
            counter: {},
            obj: { "weight": 0, "index_from": 0, "index_to": 0, "type": 0, 'service': 0 },
            url: 'http://beta.pbrf.ru/v1/',
            errors: []
        };
        _this2.calcPayment = _this2.calcPayment.bind(_this2);
        return _this2;
    }

    _createClass(Tariff, [{
        key: 'calcPayment',
        value: function calcPayment() {
            var _this = this;
            var data = _this.props.data;
            data.Value = data.value * 100;
            data.sum_num = data.sumNum * 100;
            data.direction = '0';
            if (data.service !== undefined && data.service.length !== 0) {
                data.service = data.service.join();
            } else {
                data.service = '""';
            }
            fetch(_this.state.url + 'utils/tariff/calc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            }).then(function (response) {
                return response.json();
            }).then(function (json) {
                if (json.hasOwnProperty("paynds")) {
                    _this.setState({ status: 1 });
                    _this.setState({ success: true });
                    _this.setState({
                        paynds: json.paynds / 100,
                        pay: json.pay / 100, valnds: json.ground.valnds / 100
                    });
                    if (data.cat !== 0) {
                        _this.setState({ cover: json.tariff[1].cover.valnds / 100 });
                    }
                    if (json.service) {
                        _this.setState({ service: json.service.valnds / 100 });
                    } else {
                        _this.setState({ service: 0.00 });
                    }
                    if (json.paymark) {
                        _this.setState({ paymark: json.service.paymark / 100 });
                    }
                } else {
                    _this.setState({ status: 2 });
                    var errorKeys = Object.keys(json);
                    var errorsArray = [];
                    _this.setState({ success: true });
                    var msg = void 0;
                    errorKeys.forEach(function (item) {
                        switch (item) {
                            case "weight":
                                msg = "Поле 'Масса посылки' заполнено не корректно. Также, поле вес не может превышать 2000 грамм.";errorsArray.push(msg);break;
                            case "index_from":
                                msg = "Поле 'Почтовый индекс' отправителя заполнено не корректно.";errorsArray.push(msg);break;
                            case "index_to":
                                msg = "Поле 'Почтовый индекс' получателя заполнено не корректно.";errorsArray.push(msg);break;
                            case "sum_num":
                                msg = "Поле 'Сумма наложенного платежа' заполнено не корректно.";errorsArray.push(msg);break;
                            case "Value":
                                msg = "Поле 'Сумма объявленной ценности' заполнено не корректно.";errorsArray.push(msg);break;
                        }
                    });
                    _this.setState({ errors: errorsArray });
                }
                return json;
            }).catch(function (error) {
                return error;
            });;
            return false;
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var _this3 = this;

            var keys = Object.keys(nextProps.data);
            var obj = this.state.obj;
            keys.forEach(function (key) {
                if (_this3.props.data[key] !== nextProps.data[key]) {
                    _this3.props.data[key] = nextProps.data[key];
                    if (_this3.state.obj.hasOwnProperty(key) && _this3.state.obj[key] === 0) {
                        obj[key] = 1;
                        _this3.setState({ obj: obj });
                    }
                    if (_this3.props.data[key]) {

                        var counter = Object.keys(_this3.state.obj).map(function (item) {
                            return obj[item] === 1;
                        }).length;
                        if (counter >= _this3.state.needed_attrs.length - 1) {
                            if (_this3.props.data.value !== 0 && _this3.props.data.sumNum !== 0) {
                                _this3.props.data.cat = '4';
                            } else if (_this3.props.data.value !== 0 && _this3.props.data.sumNum === 0) {
                                _this3.props.data.cat = '2';
                            } else {
                                _this3.props.data.cat = '0';
                            }
                            _this3.calcPayment();
                        }
                    }
                }
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            return _react2.default.createElement(
                _reactBootstrap.Row,
                { style: this.state.success ? null : { display: 'none' } },
                _react2.default.createElement(
                    _reactBootstrap.Col,
                    { md: 6, mdOffset: 3, sm: 12, xs: 12, style: this.state.status === 1 ? null : { display: 'none' } },
                    _react2.default.createElement(
                        _reactBootstrap.Alert,
                        { bsStyle: 'success', onDismiss: function onDismiss(e) {
                                return _this4.setState({ status: 0 });
                            } },
                        _react2.default.createElement(
                            'center',
                            null,
                            '\u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F:',
                            _react2.default.createElement(
                                'ul',
                                null,
                                this.state.paymark === 0 ? null : _react2.default.createElement(
                                    'li',
                                    null,
                                    '\u041E\u043F\u043B\u0430\u0442\u0430 \u043C\u0430\u0440\u043A\u0430\u043C\u0438: ',
                                    this.state.paymark,
                                    ' \u0440\u0443\u0431\u043B\u0435\u0439(\u0441 \u041D\u0414\u0421).'
                                ),
                                _react2.default.createElement(
                                    'li',
                                    null,
                                    '\u041F\u043E\u0447\u0442\u043E\u0432\u044B\u0439 \u0441\u0431\u043E\u0440: ',
                                    this.state.valnds,
                                    ' \u0440\u0443\u0431\u043B\u0435\u0439(\u0441 \u041D\u0414\u0421).'
                                ),
                                _react2.default.createElement(
                                    'li',
                                    null,
                                    '\u0421\u0442\u0440\u0430\u0445\u043E\u0432\u0430\u043D\u0438\u0435: ',
                                    this.state.cover,
                                    ' \u0440\u0443\u0431\u043B\u0435\u0439(\u0441 \u041D\u0414\u0421).'
                                ),
                                _react2.default.createElement(
                                    'li',
                                    null,
                                    '\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0443\u0441\u043B\u0443\u0433\u0438: ',
                                    this.state.service,
                                    ' \u0440\u0443\u0431\u043B\u0435\u0439(\u0441 \u041D\u0414\u0421).'
                                ),
                                _react2.default.createElement(
                                    'li',
                                    null,
                                    '\u0418\u0442\u043E\u0433\u043E \u0441\u0443\u043C\u043C\u0430 \u0431\u0435\u0437 \u041D\u0414\u0421: ',
                                    this.state.pay,
                                    ' \u0440\u0443\u0431\u043B\u0435\u0439.'
                                ),
                                _react2.default.createElement(
                                    'li',
                                    null,
                                    '\u0418\u0442\u043E\u0433\u043E \u0441\u0443\u043C\u043C\u0430 \u0441 \u041D\u0414\u0421 18%: ',
                                    this.state.paynds,
                                    ' \u0440\u0443\u0431\u043B\u0435\u0439.'
                                )
                            )
                        )
                    )
                ),
                _react2.default.createElement(
                    _reactBootstrap.Col,
                    { md: 6, mdOffset: 3, sm: 12, xs: 12 },
                    this.state.status == 2 ? _react2.default.createElement(
                        _reactBootstrap.Alert,
                        { bsStyle: 'danger', onDismiss: function onDismiss(e) {
                                return _this4.setState({ status: 0 });
                            } },
                        this.state.errors.map(function (error) {
                            return _react2.default.createElement(
                                'li',
                                { key: error },
                                error
                            );
                        })
                    ) : null
                )
            );
        }
    }]);

    return Tariff;
}(_react.Component);

exports.default = Tariff;
