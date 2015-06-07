/*
bzGrid v0.0.0
(c) 2015-2015 Paulo Bezerra http://paulobezerra.github.io
License: MIT
*/
angular.module('bzGrid', [])
	.directive('bzGrid', ['$q', '$parse', function($q, $parse) {
		'use strict';
		return {
			restrict: 'E',
			priority: 1001,
			scope: {
				params: '=',
				model: '='
			},
			replace: true,
			controller: ['$scope', '$parse', '$compile', '$attrs', '$element', '$sce',
				function($scope, $parse, $compile, $attrs, $element, $sce) {

					var defaultParams = {
						page: 1,
						limit: 20,
						limits: [20, 50, 75],
						sort: "id",
						order: "asc"
					};

					if ($scope.params){
						$scope.params = angular.extend($scope.params, defaultParams);
					}else{
						$scope.params = defaultParams;
					}

					if ($scope.params.fillGrid){
						$scope.model = $scope.params.fillGrid();
					}

					this.compileDirectiveTemplates = function(grid, columns) {
						
						//Cria template do GRID
						var gridTemplate = angular.element(document.createElement('div'))
							.addClass('bz-grid');
						if (grid.hovered) gridTemplate.addClass('hover');
						if (grid.striped) gridTemplate.addClass('striped');
						if (grid.bordered) gridTemplate.addClass('bordered');
						if (grid.condensed) gridTemplate.addClass('condensed');

						$element.prepend(gridTemplate);

						//Cria template do thead
						var headerTemplate = angular.element(document.createElement('div'))
							.addClass('thead');

						//Cria template dos dados do grid
						var bodyTemplate = angular.element(document.createElement('div'))
							.addClass('tbody');
						$scope.columns = columns;

						//Compila o template do grid e adiciona o thead
						var grid = $compile(gridTemplate)($scope);

						//Compila template thead e tbody
						var head = $compile(headerTemplate)($scope);
						var body = $compile(bodyTemplate)($scope);

						//Compila template do tr preenchendo tbody do grid
						var trHead = angular.element(document.createElement('div')).addClass('tr');
						var trBody = angular.element(document.createElement('div')).addClass('tr')
							.attr('ng-repeat', "row in model");

						angular.forEach($scope.columns, function(col) {
							var th = angular.element(document.createElement('div')).addClass('th')
								.css('width',col.width);
							var title = angular.element(document.createElement('a'))
								.attr('href','').html(col.title);
							if (col.sortBy) title.attr('ng-click', 'sortBy("'+col.sortBy+'")');
							th.html($compile(title)($scope));
							trHead.append(th)

							var td = angular.element(document.createElement('div')).addClass('td')
								.css('width',col.width);
							var cell = angular.element("<span>" + col.html + "</span>");
							td.html($compile(cell)($scope));
							trBody.append($compile(td)($scope));
						});
						head.append($compile(trHead)($scope))
						body.append($compile(trBody)($scope))

						grid.append($compile(head)($scope));
						grid.append($compile(body)($scope));

						//remove as tags do template
						$element.replaceWith(grid);
					}

					$scope.sortBy = function(attr) {
						if ($scope.params.sort !== attr){
							$scope.params.sort = attr;
							$scope.params.order = 'asc';
						}else{
							$scope.params.order = $scope.params.order === 'asc' ? 'desc' : 'asc';
						}

						if ($scope.params.sortBy){
							return $scope.params.sortBy(attr);
						}

						return $scope.model.sort(function(a, b) {
							var res = 0;
							if (a[attr] < b[attr])
								res = -1;
							if (a[attr] > b[attr])
								res = 1;

							if ($scope.params.order === 'desc')
								return res * (-1);

							return res;
						});
					};

					$scope.fillGrid = function(grid) {
						resource.paginate(function(result) {
							grid.data = result.data;
							grid.totalItems = result.total;
						}, function(data) {
							$scope.error_message = "Não foi possivel recuperar os registros do grid";
						}, $scope.params);
					};
				}
			],
			compile: function(element) {
				var columns = [];
				var el = element[0];
				el = angular.element(el);
				var grid = {
					hovered: el.hasClass('hovered'),
					striped: el.hasClass('striped'),
					bordered: el.hasClass('bordered'),
					condensed: el.hasClass('condensed'),
				};
				angular.forEach(angular.element(element.find('bz-column')), function(column) {
					column = angular.element(column);
					var col = {};
					col.title = column.attr('title');
					col.sortBy = column.attr('sort-by') ? column.attr('sort-by') : "";
					col.width = column.attr('width') ? column.attr('width') : "";
					col.html = column.html();
					columns.push(col);
				});
				return function(scope, element, attrs, controller) {
					controller.compileDirectiveTemplates(grid, columns);
				};
			}
		};
	}]);