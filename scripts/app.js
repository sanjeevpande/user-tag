(function($) {

	function Persons(persons) {
		this.persons = persons;
		this.isSuggestionOn = false;
		this.init = function() {
			onEdit(this);
			onBackspace(this);
			onPersonSelection(this);
		}
		var onEdit = function(self) {
			$('#inputWrapper').on('keypress', function(e) {
				var enteredChar = String.fromCharCode(e.which);
				if(enteredChar === '@') {
					self.isSuggestionOn = true;
					return;
				}
				var textContent = this.textContent.trim() + enteredChar;
				if(e.keyCode === 13) {
					$(this).css('height', parseInt($(this).css('height'), 10) + 50 + 'px');
				}
				if(textContent.length > 50) {
					var heightFact = Math.floor(textContent.length / 50);
					$(this).css('height', (50 * heightFact) + 'px');
					$(this).css('line-height', '30px');
				}
				filterPersons(textContent.toLowerCase(), self);
			});
		}
		var onBackspace = function(self) {
			$('#inputWrapper').on('keyup', function(e) {
				if(e.keyCode === 8) {	//handling backspace
					var textContent = this.textContent.trim();
					if(!textContent) {
						$('#selectedPersons').html('');
						$(this).css('height', '16px');
						$(this).css('line-height', '16px');
						self.isSuggestionOn = false;
						return;
					}
					var docFrag = document.createDocumentFragment();
					$(docFrag).append(this.innerHTML);
					var childNodes = docFrag.childNodes;
					var lastNode = childNodes[childNodes.length - 1];
					if(lastNode.tagName === 'BR' || lastNode.textContent === ' ') {	//to work in firefox
						lastNode = childNodes[childNodes.length - 2];
					}
					if(lastNode.nodeType === 1 && lastNode.className.indexOf('tag') > -1) {
						docFrag.removeChild(lastNode);
						jQuery(this).html(docFrag);
						placeCaretAtEnd(this);
					}
					filterPersons(textContent.toLowerCase(), self);
				}
			});
		}
		var onPersonSelection = function(self) {
			$('#selectedPersons').on('click', '.personName', function(e) {
				var $inputWrapper = $('#inputWrapper');
				$inputWrapper.html($inputWrapper.html().split('@')[0]);
				$inputWrapper.append('<span class="tag" contenteditable="false">'+ this.textContent +'</span>&nbsp');
				$(e.delegateTarget).html('');
				self.isSuggestionOn = false;
				placeCaretAtEnd($inputWrapper[0]);
			});
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
			var enteredChar = textContent.split('@')[1];
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
				console.log('error');
			}
		});

	});

})($);