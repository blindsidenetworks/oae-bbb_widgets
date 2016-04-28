/*!
 * Copyright 2014 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

define(['jquery', 'oae.core'], function ($, oae) {

    return function (uid) {

        // The widget container
        var $rootel = $('#' + uid);

        // Variable that keeps track of the meeting profile
        var meetingProfile = null;

        /**
         * Render the edit meeting form and initialize its validation
         */
        var setUpEditMeeting = function() {
            // Render the form elements
            oae.api.util.template().render($('#editmeeting-template', $rootel), {
                'meeting': meetingProfile
            }, $('.modal-body', $rootel));

            // Initialize jQuery validate on the form
            var validateOpts = {
                'submitHandler': editMeeting
            };
            oae.api.util.validation().validate($('#editmeeting-form', $rootel), validateOpts);
        };

        /**
         * Edit the meeting
         */
        var editMeeting = function() {
            // Disable the form
            $('#editmeeting-form *', $rootel).prop('disabled', true);

            var params = {
                'displayName': $.trim($('#editmeeting-name', $rootel).val()),
                'description': $.trim($('#editmeeting-description', $rootel).val()),
                'record': ($('#editmeeting-record', $rootel).is(":checked").toString()),
                'allModerators': ($('#editmeeting-allmoderators', $rootel).is(":checked").toString()),
                'waitModerator': ($('#editmeeting-waitmoderator', $rootel).is(":checked").toString())
            };

            oae.api.meeting.updateMeeting(meetingProfile.id, params, function (err, data) {
                // If the update succeeded, trigger the `oae.editmeeting.done` event,
                // show a success notification and close the modal
                if (!err) {
                    $('#editmeeting-modal', $rootel).modal('hide');
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__MEETING_EDITED__', 'editmeeting'),
                        oae.api.i18n.translate('__MSG__MEETING_EDIT_SUCCESS__', 'editmeeting'));
                    $(document).trigger('oae.editmeeting.done', data);
                // If the update failed, enable the form and show an error notification
                } else {
                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__MEETING_NOT_EDITED__', 'editmeeting'),
                        oae.api.i18n.translate('__MSG__MEETING_EDIT_FAIL__', 'editmeeting'),
                        'error');
                    // Enable the form
                    $('#editmeeting-form *', $rootel).prop('disabled', false);
                }
            });

            // Avoid default form submit behavior
            return false;
        };

        /**
         * Reset the widget to its original state when the modal dialog is opened and closed.
         * Ideally this would only be necessary when the modal is hidden, but IE10+ fires `input`
         * events while Bootstrap is rendering the modal, and those events can "undo" parts of the
         * reset. Hooking into the `shown` event provides the chance to compensate.
         */
        var setUpReset = function() {
            $('#editmeeting-modal', $rootel).on('shown.bs.modal hidden.bs.modal', function() {
                // Reset the form
                var $form = $('#editmeeting-form', $rootel);
                $form[0].reset();
                oae.api.util.validation().clear($form);
                // Enable the form and disable the submit button
                $('#editmeeting-form *', $rootel).prop('disabled', false);
                $('#editmeeting-form button[type="submit"]', $rootel).prop('disabled', true);
            });
        };

        /**
         * Initialize the visibility options and bind an event listener to the
         * change event of the checkboxes
         */
        var setUpVisibility = function() {
            $(document).on('click', '#editmeeting-allmoderators', function() {
                if($(this).is(":checked")) {
                    $('.editmeeting-waitmoderator').addClass('hidden');
                    $('#editmeeting-waitmoderator').prop('checked', false);
                } else {
                    $('.editmeeting-waitmoderator').removeClass('hidden');
                }
            });
        };

        /**
         * Initialize the edit meeting modal dialog
         */
        var setUpEditMeetingModal = function() {
        	setUpVisibility();

        	$(document).on('click', '.oae-trigger-editmeeting', function() {
                $('#editmeeting-modal', $rootel).modal({
                    'backdrop': 'static'
                });
                $(document).trigger('oae.context.get', 'editmeeting');
            });

            $(document).on('oae.context.send.editmeeting', function(ev, data) {
                meetingProfile = data;
                setUpEditMeeting();
            });

            // Detect changes in the form and enable the submit button
            $('#editmeeting-form', $rootel).on(oae.api.util.getFormChangeEventNames(), function() {
                $('#editmeeting-form button[type="submit"]', $rootel).prop('disabled', false);
            });

            $('#editmeeting-modal', $rootel).on('shown.bs.modal', function() {
                // Set focus to the meeting description field
                $('#editmeeting-name', $rootel).focus();
            });
        };

        setUpReset();
        setUpEditMeetingModal();

    };
});
