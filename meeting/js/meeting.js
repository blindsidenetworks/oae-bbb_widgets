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

define(['jquery', 'oae.core'], function($, oae) {

    return function(uid, showSettings, widgetData) {

    	// The widget container
        var $rootel = $('#' + uid);

        /**
         * Render the meeting description
         */
        var renderMeeting = function(meeting) {
            var html_meeting_refresh = '<button class="btn btn-link meeting-trigger-managemeeting-refresh" title="' + oae.api.i18n.translate('__MSG__REFRESH_MEETING__', 'meeting') + '"><i class="fa fa-refresh pull-left"></i></button>';
            $('#meeting-refresh', $rootel).html(html_meeting_refresh);
            $('#meeting-description', $rootel).html(oae.api.util.security().encodeForHTMLWithLinks(meeting.description));

            oae.api.meeting.infoMeeting(meeting.id, function(err, info) {
                var meeting_status;
                if (!err) {
                    if( meeting.canJoin ) {
                        ////The status should be shown based on the meetingInfo, the permissions for the user and the configuration of the meeting
                        meeting_status = '<div class="alert alert-info" role="alert">';
                        if( info.returncode === 'SUCCESS' ) {
                            meeting_status += oae.api.i18n.translate('__MSG__ALERT_MEETING_STARTED__', 'meeting');
                            meeting_status += ' ' + oae.api.i18n.translate('__MSG__ALERT_MEETING_USERCANJOIN__', 'meeting');
                        } else {
                            if( meeting.isManager || meeting.waitModerator == 'false' ) {
                                meeting_status += oae.api.i18n.translate('__MSG__ALERT_MEETING_ROOM_READY__', 'meeting');
                                meeting_status += ' ' + oae.api.i18n.translate('__MSG__ALERT_MEETING_USERCANJOIN__', 'meeting');
                            } else {
                                meeting_status += oae.api.i18n.translate('__MSG__ALERT_MEETING_ROOM_CLOSED__', 'meeting');
                                meeting_status += ' ' + oae.api.i18n.translate('__MSG__ALERT_MEETING_USERMUSTWAIT__', 'meeting');
                            }
                        }
                        meeting_status += '</div>';

                        ////The join button should be shown based on the meetingInfo, the permissions for the user and the configuration of the meeting
                        if( meeting.isManager || info.returncode === 'SUCCESS' || meeting.waitModerator == 'false' ) {
                           var html_meeting_actionbar_join = '<button class="meeting-trigger-managemeeting-join"><i class="fa fa-external-link pull-left oae-hide-when-anonymous"></i>' + oae.api.i18n.translate('__MSG__JOIN_MEETING__', 'meeting') + '</button>';
                           $('#meeting-actionbar-join', $rootel).html(html_meeting_actionbar_join);
                        }

                        ////The end button should be shown based on the meetingInfo, the permissions for the user
                        var html_meeting_actionbar_end = '';
                        if( info.returncode === 'SUCCESS' && meeting.isManager ) {
                            html_meeting_actionbar_end = '<button class="meeting-trigger-managemeeting-end"><i class="fa fa-minus-square pull-left oae-hide-when-anonymous"></i>' + oae.api.i18n.translate('__MSG__END_MEETING__', 'meeting') + '</button>';
                        }
                        $('#meeting-actionbar-end', $rootel).html(html_meeting_actionbar_end);

                    } else {
                        meeting_status = '<div class="alert alert-warning" role="alert">' + oae.api.i18n.translate('__MSG__ALERT_MEETING_USERCANNOTJOIN__', 'meeting') + '</div>';
                    }

                } else {
                    // Show an error message
                    meeting_status = '<div class="alert alert-danger" role="alert">' + oae.api.i18n.translate('__MSG__ALERT_MEETING_ERROR__', 'meeting') + '</div>';
                }

                $('#meeting-status', $rootel).html(meeting_status);

            });
        };

        /**
         * Initialize the meeting description and add a binding for description updates
         */
        var initMeeting = function() {
            if (widgetData) {
                renderMeeting(widgetData);
            }

            $(document).on('oae.editmeeting.done', function(ev, data) {
                renderMeeting(data);
            });

            $(document).on('oae.trigger.managemeeting-refresh', function(ev, data) {
                console.info('Executing the refresh');
                renderMeeting(data);
            });
        };

        initMeeting();
        console.info('meeting shown');
    };
});
