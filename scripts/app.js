'use strict';

(function($) {

	function Persons(persons) {
		this.persons = persons;
		this.isSuggestionOn = false;
		this.selectedIndex = 0;
		this.init = function() {
			$('#inputWrapper').focus();
			bindKeyInputs(this);
			bindPersonSelection(this);
		}
		var bindKeyInputs = function(self) {
			$('#inputWrapper').on('keypress', function(e) {
				onInputEdit(this, self, e.which);
			});
			$('#inputWrapper').on('keyup', function(e) {
				bindBackspace(this, self, e.keyCode);
				onInputUpdate(this, self, e.keyCode);
			});
		}
		var onInputEdit = function(inputWrapper, self, keyCode) {
			var enteredChar = String.fromCharCode(keyCode);
			if(enteredChar === '@') {
				self.isSuggestionOn = true;
				return;
			}
			var textContent = inputWrapper.textContent.trim() + enteredChar;
			filterPersons(textContent.toLowerCase(), self);
			adjustHeight(inputWrapper, textContent);
		}
		var onInputUpdate = function(inputWrapper, self, keyCode) {
			if(keyCode === 40) {	// on down arrow key press
				var $selectedChildren = $('#selectedPersons').children();
				if($selectedChildren.length) {
					self.selectedIndex++;
					self.selectedIndex = (self.selectedIndex === $selectedChildren.length + 1) ? 1 : self.selectedIndex;
					$selectedChildren.removeClass('selected');
					$($selectedChildren[self.selectedIndex - 1]).addClass('selected');
				}
			}
			if(keyCode === 13) {	// on enter key press
				if($('#selectedPersons').children().length) {
					onPersonSelection($('#selectedPersons').children()[self.selectedIndex - 1], self);
					return;
				}
				$(inputWrapper).css('height', parseInt($(inputWrapper).css('height'), 10) + 50 + 'px');
				$(inputWrapper).css('line-height', '30px');
			}
		}
		var adjustHeight = function(inputWrapper, textContent) {
			if(textContent.length > 50) {
				var inputWrapperHeight = parseInt($(inputWrapper).css('height'), 10);
				var height = Math.floor(textContent.length / 50) * 50;
				height = (height > inputWrapperHeight) ? height : inputWrapperHeight;
				$(inputWrapper).css('height', height + 'px');
				$(inputWrapper).css('line-height', '30px');
			}
		}
		var bindBackspace = function(inputWrapper, self, keyCode) {
			if(keyCode === 8) {
				var textContent = inputWrapper.textContent.trim();
				if(!textContent) {
					$('#selectedPersons').html('');
					$(inputWrapper).css('height', '16px');
					$(inputWrapper).css('line-height', '16px');
					self.isSuggestionOn = false;
					return;
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
				filterPersons(textContent.toLowerCase(), self);
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
			wrapperString = wrapperString.substring(0, wrapperString.lastIndexOf("@"));
			$inputWrapper.html(wrapperString);
			$inputWrapper.append('<span class="tag" contenteditable="false">'+ selectedItem.textContent +'</span>&nbsp');
			$('#selectedPersons').html('');
			self.isSuggestionOn = false;
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
		var filterPersons = function(textContent, self) {
			if(!self.isSuggestionOn || !textContent) {
				return;
			}
			var suggestions = '';
			var enteredChar = textContent.split('@');
			enteredChar = enteredChar[enteredChar.length - 1];
			enteredChar = enteredChar ? enteredChar.trim() : enteredChar;
			enteredChar = enteredChar ? enteredChar.split(' ')[0] : enteredChar;
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