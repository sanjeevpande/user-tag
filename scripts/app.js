'use strict';

(function($) {

	function Persons(persons) {
		this.persons = persons;
		this.isSuggestionOn = false;
		this.suggestionChars = [];
		this.selectedIndex = 0;
		this.init = function() {
			$('#inputWrapper').focus();
			bindKeyEvents(this);
			bindPersonSelection(this);
		}
		var bindKeyEvents = function(self) {
			$('#inputWrapper').on('keypress', function(e) {
				if(e.keyCode !== 8) {
					onInputEdit(this, self, e);
				}
			});
			$('#inputWrapper').on('keyup', function(e) {
				bindBackspace(this, self, e.keyCode);
				bindDropdown(this, self, e.keyCode);
			});
		}
		var onInputEdit = function(inputWrapper, self, e) {
			var keyCode = e.which;
			if(keyCode === 0) {
				return;
			}
			var enteredChar = String.fromCharCode(keyCode);
			if(enteredChar === '@') {
				self.isSuggestionOn = true;
				return;
			}
			if(self.isSuggestionOn && enteredChar.trim()) {
				self.suggestionChars.push(enteredChar);
			} else {
				self.suggestionChars = [];
				self.isSuggestionOn = false;
			}
			filterPersons(self);
			adjustHeight(inputWrapper);
			onEnter(inputWrapper, self, e);
		}
		var onEnter = function(inputWrapper, self, e) {
			if(e.keyCode === 13) {	// on enter key press
				if($('#selectedPersons').children().length) {
					e.preventDefault();
					onPersonSelection($('#selectedPersons').children()[self.selectedIndex - 1], self);
					return;
				}
				$(inputWrapper).css('height', parseInt($(inputWrapper).css('height'), 10) + 50 + 'px');
				$(inputWrapper).css('line-height', '30px');
			}
		}
		var bindDropdown = function(inputWrapper, self, keyCode) {
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
		var adjustHeight = function(inputWrapper) {
			var textContent = inputWrapper.textContent.trim();
			if(textContent.length > 50) {
				var inputWrapperHeight = parseInt($(inputWrapper).css('height'), 10);
				var height = Math.floor(textContent.length / 50) * 50;
				height = (height > inputWrapperHeight) ? height : inputWrapperHeight;
				$(inputWrapper).css('height', height + 'px');
				$(inputWrapper).css('line-height', '30px');
			}
		}
		var resetInputWrapper = function(inputWrapper, self) {
			$('#selectedPersons').html('');
			$(inputWrapper).css('height', '16px');
			$(inputWrapper).css('line-height', '16px');
			self.isSuggestionOn = false;
			self.suggestionChars = [];
		}
		var bindBackspace = function(inputWrapper, self, keyCode) {
			if(keyCode === 8) {
				var textContent = inputWrapper.textContent.trim();
				if(!textContent) {
					resetInputWrapper(inputWrapper, self);
					return;
				}
				if(self.isSuggestionOn && self.suggestionChars.length) {
					self.suggestionChars.pop();
				}
				var docFrag = document.createDocumentFragment();
				$(docFrag).append(inputWrapper.innerHTML);
				var childNodes = docFrag.childNodes;
				var lastNode = childNodes[childNodes.length - 1];
				if(lastNode.tagName === 'BR' || !lastNode.textContent.trim()) {	//to work in firefox
					lastNode = childNodes[childNodes.length - 2];
				}
				if(lastNode.nodeType === 1 && lastNode.className.indexOf('tag') > -1) {
					docFrag.removeChild(lastNode);
					jQuery(inputWrapper).html(docFrag);
					placeCaretAtEnd(inputWrapper);
				}
				if(self.isSuggestionOn && !self.suggestionChars.length) {
					textContent = '';
				}
				filterPersons(self, textContent.toLowerCase());
			}
		}
		var bindPersonSelection = function(self) {
			$('#selectedPersons').on('click', '.personName', function() {
				onPersonSelection(this, self);
			});
		}
		var onPersonSelection = function(selectedItem, self) {
			var $inputWrapper = $('#inputWrapper');
			var wrapperString = $inputWrapper.html();
			var lastIndex = wrapperString.lastIndexOf("@");
			var str = wrapperString.substring(0, lastIndex);
			$inputWrapper.html(str);
			$inputWrapper.append('<span class="tag" contenteditable="false">'+ selectedItem.textContent +'</span>&nbsp');
			$inputWrapper.append(wrapperString.substring(lastIndex + 2 , wrapperString.length));
			$('#selectedPersons').html('');
			self.isSuggestionOn = false;
			self.suggestionChars = [];
			placeCaretAtEnd($inputWrapper[0]);
		}
		var placeCaretAtEnd = function(el) {
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
		var filterPersons = function(self, textContent) {
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
			url: 'persons.json',
			method: 'GET',
			success: function(res) {
				var persons = new Persons(res.persons);
				persons.init();
			},
			error: function() {
				console.log('Error fetching persons json.');
			}
		});

	});

})($);