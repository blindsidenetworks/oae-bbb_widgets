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

casper.test.begin('Widget - Meeting', function(test) {

    /**
     * Verify that all meeting elements are present
     */
    var verifyMeetingElements = function() {
        casper.waitForSelector('#meeting-description', function() {
            test.assertExists('#meeting-description', 'Verify the meeting description container is present');
            test.assertSelectorHasText('#meeting-description', 'Talk about all the things!', 'Verify the meeting description container holds the correct meeting description');
        });
    };

    casper.start(configUtil.tenantUI, function() {
        // Create a user to test with
        userUtil.createUsers(1, function(user1) {
            // Login with that user
            userUtil.doLogIn(user1.username, user1.password);

            meetingUtil.createMeeting(null, null, null, null, null, function(err, meetingProfile) {
                // Redirect to the meeting profile
                uiUtil.openMeetingProfile(meetingProfile);

                casper.then(function() {
                    casper.echo('# Verify meeting elements', 'INFO');
                    verifyMeetingElements();
                });

                // Log out the admin user
                userUtil.doLogOut();
            });
        });
    });

    casper.run(function() {
        test.done();
    });
});
