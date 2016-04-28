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

        // Variable that keeps track of the people and groups to share this meeting with
        var members = [];

        // Variable that keeps track of the selected visibility for the meeting to create
        var visibility = null;

        // Generate a widget ID for the new instance of the `setpermissions` widget. This widget ID
        // will be used in the event communication between this widget and the `setpermissions` widget.
        var setPermissionsId = oae.api.util.generateId();

        // Variable that keeps track of the current context
        var contextData = null;

        /**
         * Reset the widget to its original state when the modal dialog is closed
         */
        var setUpReset = function() {
            $('#createmeeting-modal', $rootel).on('hidden.bs.modal', function() {
                // Reset the form
                var $form = $('#createmeeting-form', $rootel);
                $form[0].reset();
                oae.api.util.validation().clear($form);
                showOverview();

                // Unbind the setpermissions handler
                $(document).off('oae.setpermissions.changed.' + setPermissionsId);
            });
        };

        /**
         * Initialize the create collabdoc form and validation
         */
        var setUpCreateMeeting = function() {
            var validateOpts = {
                'submitHandler': createMeeting
            };
            oae.api.util.validation().validate($('#createmeeting-form', $rootel), validateOpts);
        };

        /**
         * Show the permissions widget to allow for updates in visiblity and members
         */
        var showPermissions = function() {
            // Hide all containers
            $('.modal-body > div:visible', $rootel).hide();
            $('#createmeeting-form > .modal-footer', $rootel).hide();
            // Show the permissions container
            $('#createmeeting-permissions-container', $rootel).show();
        };

        /**
         * Show the main panel of the widget
         */
        var showOverview = function() {
            // Hide all containers
            $('.modal-body > div:visible', $rootel).hide();
            // Show the overview container
            $('#createmeeting-form > .modal-footer', $rootel).show();
            $('#createmeeting-overview-container', $rootel).show();
        };

        /**
         * Load the `setpermissions` widget into this widget. That widget will take care of permission
         * management (visibility + sharing) of the meeting
         */
        var setUpSetPermissions = function() {

            // Remove the previous `setpermissions` widget
            var $setPermissionsContainer = $('#createmeeting-permissions-container', $rootel);
            $setPermissionsContainer.html('');

            // When the current context is the current user, the configured default tenant visibility for meetings
            // will be used as the default visibility. Otherwise, the visibility of the current context will be
            // used as the default visibility
            if (contextData.id === oae.data.me.id) {
                visibility = oae.api.config.getValue('oae-bbb', 'visibility', 'meeting');
            } else {
                visibility = contextData.visibility;
            }

            // Event that will be triggered when permission changes have been made in the `setpermissions` widget
            $(document).on('oae.setpermissions.changed.' + setPermissionsId, function(ev, data) {
                // Update visibility for meeting
                visibility = data.visibility;

                members = _.without(data.shared, oae.data.me.id);

                // Add the permissions summary
                $('#createmeeting-permissions', $rootel).html(data.summary);

                // Switch back to the overview
                showOverview();
            });

            // Event that will be triggered when permission changes have been cancelled
            $(document).on('oae.setpermissions.cancel.' + setPermissionsId, showOverview);

            // Always add the created meeting to the current user's meeting library
            var preFill = [{
                'displayName': oae.api.i18n.translate('__MSG__MY_MEETINGS__'),
                'id': oae.data.me.id,
                'fixed': true
            }];

            // If the current user is creating the meeting from a within a group,
            // the group is added as a fixed item as well
            if (contextData.id !== oae.data.me.id) {
                preFill.push($.extend({'fixed': true}, contextData));
            }

            // Load the `setpermissions` widget into its container
            oae.api.widget.insertWidget('setpermissions', setPermissionsId, $setPermissionsContainer, false, {
                'count': 1,
                'preFill': preFill,
                'type': 'meeting',
                'visibility': visibility
            });
        };

        /**
         * Create the meeting. When the meeting has been created successfully, the user will be redirected
         * to the created meeting
         */
        var createMeeting = function() {
            console.info('CreateMeeting');
            // Disable the form
            $('#createmeeting-form *', $rootel).prop('disabled', true);

            var meetingName = $.trim($('#createmeeting-name', $rootel).val());
            var meetingDescription = $.trim($('#createmeeting-description', $rootel).val());
            var meetingRecord = $('#createmeeting-record').is(":checked").toString();
            var meetingAllModerators = $('#createmeeting-allmoderators').is(":checked").toString();
            var meetingWaitModerator = $('#createmeeting-waitmoderator').is(":checked").toString();

            oae.api.meeting.createMeeting(meetingName, meetingDescription, meetingRecord, meetingAllModerators, meetingWaitModerator, visibility, [], members, function (err, data) {
                // If the creation succeeded, redirect to the meeting profile
                if (!err) {
                    window.location = data.profilePath;
                } else {
                    // Re-enable the form
                    $('#createmeeting-form *', $rootel).prop('disabled', true);

                    oae.api.util.notification(
                        oae.api.i18n.translate('__MSG__MEETING_NOT_CREATED__', 'createmeeting'),
                        oae.api.i18n.translate('__MSG__MEETING_CREATE_FAIL__', 'createmeeting'),
                        'error');
                }
            });

            // Avoid default form submit behavior
            return false;
        };

        /**
         * Initialize the visibility options and bind an event listener to the
         * change event of the checkboxes
         */
        var setUpVisibility = function() {
            $('#createmeeting-allmoderators').on('change', function() {
                if($(this).is(":checked")) {
                    $('.createmeeting-waitmoderator').addClass('hidden');
                    $('#createmeeting-waitmoderator').prop('checked', false);
                } else {
                    $('.createmeeting-waitmoderator').removeClass('hidden');
                }
            });
        };

        /**
         * Initialize the create meeting modal dialog
         */
        var setUpCreateMeetingModal = function() {
            setUpVisibility();

            $(document).on('click', '.oae-trigger-createmeeting', function() {
                // Request the context information
                $(document).trigger('oae.context.get', 'createmeeting');
            });

            // Receive the context information and cache it
            $(document).on('oae.context.send.createmeeting', function(ev, ctx) {
                contextData = ctx;
                $('#createmeeting-modal', $rootel).modal({
                    'backdrop': 'static'
                });
            });

            $('#createmeeting-modal', $rootel).on('shown.bs.modal', function() {
                // IE10 has a problem where it treats the placeholder text as the textarea's
                // value. Therefore, we need to explicitly clear the value of the textarea to
                // make the placeholder behave like a placeholder.
                // @see https://github.com/oaeproject/3akai-ux/pull/2906
                $('#createmeeting-description', $rootel).val('');
                // Set focus to the meeting description field
                $('#createmeeting-name', $rootel).focus();

                // Initiate the permissions widget
                setUpSetPermissions();
            });

            // Binds the 'change' button that shows the setpermissions widget
            $rootel.on('click', '.setpermissions-change-permissions', showPermissions);
        };

        setUpCreateMeetingModal();
        setUpCreateMeeting();
        setUpReset();

    };
});
