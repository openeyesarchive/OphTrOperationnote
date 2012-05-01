
function callbackAddProcedure(procedure_id) {
	var eye = $('input[name="ElementProcedureList\[eye_id\]"]:checked').val();

	$.ajax({
		'type': 'GET',
		'url': '/OphTrOperationnote/Default/loadElementByProcedure?procedure_id='+procedure_id+'&eye='+eye,
		'success': function(html) {
			if (html.length >0) {
				var m = html.match(/<div class="(Element.*?)"/);
				if (m) {
					m[1] = m[1].replace(/ .*$/,'');

					if ($('div.'+m[1]).length <1) {
						$('div.ElementAnaesthetic').before(html);
						$('div.'+m[1]).attr('style','display: none;');
						$('div.'+m[1]).removeClass('hidden');
						$('div.'+m[1]).slideToggle('fast');
					}
				}
			}
		}
	});
}

/*
 * Post the removed operation_id and an array of ElementType class names currently in the DOM
 * This should return any ElementType classes that we should remove.
 */

function callbackRemoveProcedure(procedure_id) {
	var procedures = '';

	$('div.procedureItem').children('input[type="hidden"]').map(function() {
		if (procedures.length >0) {
			procedures += ',';
		}
		procedures += $(this).val();
	});

	$.ajax({
		'type': 'POST',
		'url': '/OphTrOperationnote/Default/getElementsToDelete',
		'data': "remaining_procedures="+procedures+"&procedure_id="+procedure_id,
		'dataType': 'json',
		'success': function(data) {
			$.each(data, function(key, val) {
				$('div.'+val).slideToggle('fast',function() {
					$('div.'+val).remove();
				});
			});
		}
	});
}

/* If this function doesn't exist eyedraw click events default and cause bad behaviour */

function eDparameterListener(_drawing) {
	if (_drawing.selectedDoodle != null) {
		if (_drawing.selectedDoodle != null && _drawing.selectedDoodle.className == 'PhakoIncision') {
			setCataractSelectInput('incision_site',_drawing.selectedDoodle.getParameter('incisionSite'));
			setCataractSelectInput('incision_type',_drawing.selectedDoodle.getParameter('incisionType'));
			setCataractInput('length',_drawing.selectedDoodle.getParameter('incisionLength'));
			setCataractInput('meridian',_drawing.selectedDoodle.getParameter('incisionMeridian'));
		}
	}
}

function setCataractSelectInput(key, value) {
	$('#ElementCataract_'+key+'_id').children('option').map(function() {
		if ($(this).text() == value) {
			$('#ElementCataract_'+key+'_id').val($(this).val());
		}
	});
}

function setCataractInput(key, value) {
	$('#ElementCataract_'+key).val(value);
}

$(document).ready(function() {
	$('#et_save').unbind('click').click(function() {
		if (!$(this).hasClass('inactive')) {
			disableButtons();
			return true;
		}
		return false;
	});

	$('#et_cancel').unbind('click').click(function() {
		if (!$(this).hasClass('inactive')) {
			disableButtons();

			if (m = window.location.href.match(/\/update\/[0-9]+/)) {
				window.location.href = window.location.href.replace('/update/','/view/');
			} else {
				window.location.href = '/patient/episodes/'+et_patient_id;
			}
		}
		return false;
	});

	$("button[id$='_generate_report']").unbind('click').click(function(e) {
		e.preventDefault();

		var buttonClass = $(this).attr('id').replace(/_generate_report$/,'');
		var eyeDrawName = buttonClass.replace(/Element/,'');

		var text = window["ed_drawing_edit_"+eyeDrawName].report().replace(/, +$/, '');

		if ($('#'+buttonClass+'_report').text().length >0) {
			text += ', '+text;
		}

		$('#'+buttonClass+'_report').text($('#'+buttonClass+'_report').text() + text);

		return false;
	});

	$('#ElementCataract_incision_site_id').unbind('change').change(function(e) {
		e.preventDefault();

		ed_drawing_edit_Cataract.setParameterForDoodleOfClass('PhakoIncision', 'incisionSite', $(this).children('option:selected').text());

		return false;
	});

	$('#ElementCataract_incision_type_id').unbind('change').change(function(e) {
		e.preventDefault();

		ed_drawing_edit_Cataract.setParameterForDoodleOfClass('PhakoIncision', 'incisionType', $(this).children('option:selected').text());

		return false;
	});

	$('input[name="ElementProcedureList\[eye_id\]"]').unbind('change').change(function() {

		if ($('#typeProcedure').is(':hidden')) {
			$('#typeProcedure').slideToggle('fast');
		}

		if (window.ed_drawing_edit_Cataract !== undefined) {
			var doodle = null;
			var doodle2 = null;

			for (var i in ed_drawing_edit_Cataract.doodleArray) {
				if (ed_drawing_edit_Cataract.doodleArray[i].className == 'PhakoIncision') {
					doodle = ed_drawing_edit_Cataract.doodleArray[i];
				}
			}

			for (var i in ed_drawing_edit_Position.doodleArray) {
				if (ed_drawing_edit_Position.doodleArray[i].className == 'Surgeon') {
					doodle2 = ed_drawing_edit_Position.doodleArray[i];
				}
			}

			if ($(this).val() == 2) { //right
				if (parseInt(doodle.rotation * (180/Math.PI)) == 90) {
					et_operationnote_hookDoodle = doodle;
					et_operationnote_hookTarget = -90;
					et_operationnote_hookDirection = 1;
					opnote_move_eyedraw_element_to_position();
				}

				if (parseInt(doodle2.rotation * (180/Math.PI)) == 270) {
					et_operationnote_hookDoodle2 = doodle2;
					et_operationnote_hookTarget2 = 90;
					et_operationnote_hookDirection2 = 1;
					opnote_move_eyedraw_element_to_position2();
				}

			} else if ($(this).val() == 1) { //left
				if (parseInt(doodle.rotation * (180/Math.PI)) == -90) {
					et_operationnote_hookDoodle = doodle;
					et_operationnote_hookTarget = 90;
					et_operationnote_hookDirection = 0;
					opnote_move_eyedraw_element_to_position();
				}

				if (parseInt(doodle2.rotation * (180/Math.PI)) == 90) {
					et_operationnote_hookDoodle2 = doodle2;
					et_operationnote_hookTarget2 = 270;
					et_operationnote_hookDirection2 = 0;
					opnote_move_eyedraw_element_to_position2();
				}
			}
		}
	});

	$('input[name="ElementAnaesthetic\[anaesthetic_type_id\]"]').unbind('click').click(function() {
		if ($(this).val() == 5) {
			if (!$('#anaesthetist_id').is(':hidden') && !anaesthetic_type_sliding) {
				anaesthetic_type_sliding = true;
				$('#anaesthetist_id').slideToggle('fast');
				$('#anaesthetic_delivery_id').slideToggle('fast');
				$('#div_ElementAnaesthetic_Agents').slideToggle('fast');
				$('#div_ElementAnaesthetic_Complications').slideToggle('fast');
				$('#div_ElementAnaesthetic_anaesthetic_comment').slideToggle('fast',function() {
					anaesthetic_type_sliding = false;
				});
			}
		} else {
			if ($('#anaesthetist_id').is(':hidden') && !anaesthetic_type_sliding) {
				anaesthetic_type_sliding = true;
				$('#anaesthetist_id').slideToggle('fast');
				$('#anaesthetic_delivery_id').slideToggle('fast');
				$('#div_ElementAnaesthetic_Agents').slideToggle('fast');
				$('#div_ElementAnaesthetic_Complications').slideToggle('fast');
				$('#div_ElementAnaesthetic_anaesthetic_comment').slideToggle('fast',function() {
					anaesthetic_type_sliding = false;
				});
			}
		}

		if ($(this).val() == 1) {
			$('input[name="ElementAnaesthetic\[anaesthetic_delivery_id\]"]').map(function() {
				if ($(this).val() == 5) {
					$(this).click();
				}
			});
		}
	});

	$('#ElementCataract_meridian').unbind('change').change(function() {
		var doodle = null;

		for (var i in ed_drawing_edit_Cataract.doodleArray) {
			if (ed_drawing_edit_Cataract.doodleArray[i].className == 'PhakoIncision') {
				doodle = ed_drawing_edit_Cataract.doodleArray[i];
			}
		}

		doodle.setParameter('incisionMeridian',$(this).val());
		ed_drawing_edit_Cataract.repaint();
	});

	$('#ElementCataract_length').unbind('change').change(function() {
		var doodle = null;

		for (var i in ed_drawing_edit_Cataract.doodleArray) {
			if (ed_drawing_edit_Cataract.doodleArray[i].className == 'PhakoIncision') {
				doodle = ed_drawing_edit_Cataract.doodleArray[i];
			}
		} 

		doodle.setParameter('incisionLength',$(this).val());
		ed_drawing_edit_Cataract.repaint();
	});

	$('#ElementCataract_iol_type_id').unbind('change').change(function() {
		if ($(this).children('option:selected').text() == 'MTA3UO' || $(this).children('option:selected').text() == 'MTA4UO') {
			$('#ElementCataract_iol_position_id').val(4);
		}
	});
});

var anaesthetic_type_bind = false;
var anaesthetic_type_sliding = false;

var et_operationnote_hookDoodle = null;
var et_operationnote_hookTarget = 0;
var et_operationnote_hookDirection = 0;

var et_operationnote_hookDoodle2 = null;
var et_operationnote_hookTarget2 = 0;
var et_operationnote_hookDirection2 = 0;

function opnote_move_eyedraw_element_to_position() {
	var target = et_operationnote_hookTarget;
	var doodle = et_operationnote_hookDoodle;
	var pos = parseInt(doodle.rotation * (180/Math.PI));

	if (et_operationnote_hookDirection == 0) {
		if (pos < target) {
			pos += 10;
			if (pos > target) {
				doodle.rotation = target * (Math.PI/180);
				ed_drawing_edit_Cataract.repaint();
				ed_drawing_edit_Cataract.modified = false;
			} else {
				doodle.rotation = pos * (Math.PI/180);
				ed_drawing_edit_Cataract.repaint();
				setTimeout('opnote_move_eyedraw_element_to_position();', 20);
			}
		}
	} else {
		if (pos > target) {
			pos -= 10;
			if (pos < target) {
				doodle.rotation = target * (Math.PI/180);
				ed_drawing_edit_Cataract.repaint();
				ed_drawing_edit_Cataract.modified = false;
			} else {
				doodle.rotation = pos * (Math.PI/180);
				ed_drawing_edit_Cataract.repaint();
				setTimeout('opnote_move_eyedraw_element_to_position();', 20);
			}
		}
	}
}

function opnote_move_eyedraw_element_to_position2() {
	var target = et_operationnote_hookTarget2;
	var doodle = et_operationnote_hookDoodle2;
	var pos = parseInt(doodle.rotation * (180/Math.PI));

	if (et_operationnote_hookDirection2 == 0) {
		if (pos < target) {
			pos += 10;
			if (pos > target) {
				doodle.rotation = target * (Math.PI/180);
				doodle.originY = 0 - (300 * Math.sin(((target-90) * (Math.PI/180))));
				doodle.originX = 300 * Math.cos(((target-90) * (Math.PI/180)));

				ed_drawing_edit_Position.repaint();
				ed_drawing_edit_Position.modified = false;
			} else {
				doodle.rotation = pos * (Math.PI/180);
				doodle.originY = 0 - (300 * Math.sin(((pos-90) * (Math.PI/180))));
				doodle.originX = 300 * Math.cos(((pos-90) * (Math.PI/180)));

				ed_drawing_edit_Position.repaint();
				setTimeout('opnote_move_eyedraw_element_to_position2();', 20);
			}
		}
	} else {
		if (pos > target) {
			pos -= 10;
			if (pos < target) {
				doodle.rotation = target * (Math.PI/180);
				doodle.originY = 0 - (300 * Math.sin(((target-90) * (Math.PI/180))));
				doodle.originX = 300 * Math.cos(((target-90) * (Math.PI/180)));

				ed_drawing_edit_Position.repaint();
				ed_drawing_edit_Position.modified = false;
			} else {
				doodle.rotation = pos * (Math.PI/180);
				doodle.originY = 0 - (300 * Math.sin(((pos-90) * (Math.PI/180))));
				doodle.originX = 300 * Math.cos(((pos-90) * (Math.PI/180)));

				ed_drawing_edit_Position.repaint();
				setTimeout('opnote_move_eyedraw_element_to_position2();', 20);
			}
		}
	}
}
