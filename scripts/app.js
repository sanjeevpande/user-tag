'use strict';

(function($) {

	function UserTag(persons) {
		this.persons = persons || [];
		this.isSuggestionOn = false;
		this.suggestionChars = [];
		this.selectedIndex = 0;
		this.enableSuggestion = false;
		this.init = function() {
			$('#inputWrapper').focus();
			_bindKeyEvents(this);
			_bindPersonSelection(this);
		}
		var _bindKeyEvents = function(self) {

			$('#inputWrapper').on('keyup', function(e) {
				var code = e.keyCode || e.which;
				if (code == 0 || code == 229) { //for android chrome keycode
			    	var value = this.innerHTML;
			        code = value.charCodeAt(value.length - 1);
			    }
			    if(e.keyCode !== 8) {
					_onInputEdit(this, self, e, code);
				}
				_bindDropdown(this, self, code);
			});

			$('#inputWrapper').on('keydown', function(e) {
				self.enableSuggestion = (e.shiftKey && e.keyCode === 50) ? true : false;
				_bindBackspace(this, self, e.keyCode);
			});
		}
		var _onInputEdit = function(inputWrapper, self, e, keyCode) {
			if(keyCode === 0) {
				return;
			}
			var enteredChar = String.fromCharCode(keyCode);
			if(enteredChar === '@' || (self.enableSuggestion)) {
				self.isSuggestionOn = true;
				return;
			}
			if(self.isSuggestionOn && enteredChar.trim()) {
				self.suggestionChars.push(enteredChar);
			} else {
				if(keyCode !== 13) {
					self.suggestionChars = [];
					self.isSuggestionOn = false;
				}
			}
			_filterPersons(self);
			_adjustHeight(inputWrapper);
			_onEnter(inputWrapper, self, e);
		}
		var _onEnter = function(inputWrapper, self, e) {
			if(e.keyCode === 13) {	// on enter key press
				if($('#selectedPersons').children().length) {
					e.preventDefault();
					_onPersonSelection($('#selectedPersons').children()[self.selectedIndex - 1], self);
					return;
				}
				$(inputWrapper).css('height', parseInt($(inputWrapper).css('height'), 10) + 50 + 'px');
				$(inputWrapper).css('line-height', '30px');
			}
		}
		var _bindDropdown = function(inputWrapper, self, keyCode) {
			if(keyCode === 40) {	// on down arrow key press
				var $selectedChildren = $('#selectedPersons').children();
				if($selectedChildren.length) {
					self.selectedIndex++;
					self.selectedIndex = (self.selectedIndex === $selectedChildren.length + 1) ? 1 : self.selectedIndex;
					$selectedChildren.removeClass('selected');
					$($selectedChildren[self.selectedIndex - 1]).addClass('selected');
				}
			}
		}
		var _adjustHeight = function(inputWrapper) {
			var textContent = inputWrapper.textContent.trim();
			if(textContent.length > 50) {
				var inputWrapperHeight = parseInt($(inputWrapper).css('height'), 10);
				var height = Math.floor(textContent.length / 50) * 50;
				height = (height > inputWrapperHeight) ? height : inputWrapperHeight;
				$(inputWrapper).css('height', height + 'px');
				$(inputWrapper).css('line-height', '30px');
			}
		}
		var _resetInputWrapper = function(inputWrapper, self) {
			$('#selectedPersons').html('');
			$(inputWrapper).css('height', '16px');
			$(inputWrapper).css('line-height', '16px');
			self.isSuggestionOn = false;
			self.suggestionChars = [];
		}
		var _bindBackspace = function(inputWrapper, self, keyCode) {
			if(keyCode === 229) {	//for android chrome keycode
				var value = inputWrapper.innerHTML;
				var code = value.charCodeAt(value.length - 1);
				if(code === 62) {
					keyCode = 8;
				}
			}
			if(keyCode === 8) {
				var textContent = inputWrapper.textContent.trim();
				if(!textContent) {
					_resetInputWrapper(inputWrapper, self);
					return;
				}
				if(self.isSuggestionOn && self.suggestionChars.length) {
					self.suggestionChars.pop();
				}
				var docFrag = document.createDocumentFragment();
				$(docFrag).append(inputWrapper.innerHTML);
				var childNodes = docFrag.childNodes;
				var lastNode = childNodes[childNodes.length - 1];
				if(lastNode.tagName === 'BR' || lastNode.textContent === ' ') {	//to work in firefox
					lastNode = childNodes[childNodes.length - 2];
				}
				if(lastNode.nodeType === 1 && lastNode.className.indexOf('tag') > -1) {
					docFrag.removeChild(lastNode);
					jQuery(inputWrapper).html(docFrag);
					_placeCaretAtEnd(inputWrapper);
				}
				if(self.isSuggestionOn && !self.suggestionChars.length) {
					textContent = '';
				}
				_filterPersons(self, textContent.toLowerCase());
			}
		}
		var _bindPersonSelection = function(self) {
			$('#selectedPersons').on('click', '.personName', function() {
				_onPersonSelection(this, self);
			});
		}
		var _onPersonSelection = function(selectedItem, self) {
			var $inputWrapper = $('#inputWrapper');
			var wrapperString = $inputWrapper.html();
			var lastIndex = wrapperString.lastIndexOf("@");
			var str = wrapperString.substring(0, lastIndex);
			$inputWrapper.html(str);
			$inputWrapper.append('<span class="tag" contenteditable="false">'+ selectedItem.textContent +'</span>&nbsp');
			str = wrapperString.substring(lastIndex + self.suggestionChars.length + 1, wrapperString.length);
			str = str.substring(str.indexOf(' '), str.length);
			$inputWrapper.append(str);
			$('#selectedPersons').html('');
			self.isSuggestionOn = false;
			self.suggestionChars = [];
			_placeCaretAtEnd($inputWrapper[0]);
		}
		var _placeCaretAtEnd = function(el) {
			el.focus();
		    if (typeof window.getSelection != "undefined"
		            && typeof document.createRange != "undefined") {
		        var range = document.createRange();
		        range.selectNodeContents(el);
		        range.collapse(false);
		        var sel = window.getSelection();
		        sel.removeAllRanges();
		        sel.addRange(range);
		    } else if (typeof document.body.createTextRange != "undefined") {
		        var textRange = document.body.createTextRange();
		        textRange.moveToElementText(el);
		        textRange.collapse(false);
		        textRange.select();
		    }
		}
		var _filterPersons = function(self, textContent) {
			if(!self.isSuggestionOn && !self.suggestionChars.length) {
				return;
			}
			var suggestions = '';
			var enteredChar = textContent ? textContent : self.suggestionChars.join('');
			enteredChar = enteredChar.toLowerCase();
			self.persons.forEach(function(person) {
			   	if(person.name.toLowerCase().startsWith(enteredChar)) {
					suggestions += '<span class="personName">'+ person.name +'</span>';
				}
			});
			$('#selectedPersons').html(suggestions);
		}
	}

	$(document).ready(function() {

		$.ajax({
			url: '/persons.json',
			method: 'GET',
			success: function(res) {
				var userTag = new UserTag(res.persons);
				userTag.init();
			},
			error: function() {
				console.log('Error fetching persons json.');
			}
		});

	});

})($);