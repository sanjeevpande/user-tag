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
				filterPersons(textContent.toLowerCase(), self);
			});
		}
		var onBackspace = function(self) {
			$('#inputWrapper').on('keyup', function(e) {
				if(e.keyCode === 8) {	//handling backspace
					var textContent = this.textContent.trim();
					if(!textContent) {
						return;
					}
					var docFrag = document.createDocumentFragment();
					$(docFrag).append(this.innerHTML);
					var childNodes = docFrag.childNodes;
					var lastNode = childNodes[childNodes.length - 1];
					if(lastNode.nodeType === 1) {
						docFrag.removeChild(lastNode);
						jQuery(this).html(docFrag);
					}
					filterPersons(textContent.toLowerCase(), self);
				}
			});
		}
		var onPersonSelection = function(self) {
			$('#selectedPersons').on('click', '.personName', function(e) {
				var $inputWrapper = $('#inputWrapper');
				$inputWrapper.html($inputWrapper.html().split('@')[0]);
				$inputWrapper.append('<span contenteditable="false">'+ this.textContent +'</span>&nbsp');
				$(e.delegateTarget).html('');
				self.isSuggestionOn = false;
			});
		}
		var filterPersons = function(textContent, self) {
			if(!self.isSuggestionOn || !textContent) {
				return;
			}
			var suggestions = '';
			var enteredChar = textContent.split('@')[1].split(' ')[0];
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