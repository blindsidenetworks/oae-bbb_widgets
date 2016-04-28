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

casper.test.begin('Widget - Create meeting', function(test) {

    /**
     * Open the create meeting modal with assertions
     */
    var openCreateMeeting = function() {
        // Wait till the widget loading mechanisme is ready
        // Do this by waiting till a template has been rendered
        casper.waitForSelector('#me-clip-container .oae-clip', function() {
            casper.waitForSelector('.oae-clip-secondary .oae-clip-content > button', function() {
                casper.click('.oae-clip-secondary .oae-clip-content > button');
                test.assertExists('.oae-trigger-createmeeting', 'create meeting trigger exists');
                casper.click('.oae-trigger-createmeeting');
                casper.waitForSelector('.setpermissions-summary', function() {
                    test.assertVisible('#createmeeting-modal', 'create meeting pane is showing after trigger');
                    casper.click('.oae-clip-secondary .oae-clip-content > button');
                });
            });
        });
    };

    /**
     * Goes through the workflow of creating a meeting
     */
    var verifyCreatemeeting = function(user2Id) {
        // Verify the form is present
        test.assertExists('form#createmeeting-form', 'The create meeting form is present');
        test.assertExists('#createmeeting-name', 'The meeting name field is present');
        test.assertExists('#createmeeting-description', 'The meeting description field is present');
        // Fill the form
        casper.fill('form#createmeeting-form', {
            'createmeeting-name': 'Testing tools',
            'createmeeting-description': 'Discuss what tools you use and why.'
        }, false);

        // Verify the change permissions button is there
        test.assertExists('.setpermissions-change-permissions', 'The \'change permissions\' button is present');
        // Click the change permissions button
        casper.click('.setpermissions-change-permissions');
        // Verify the permissions radio button group and share input fields are there
        test.assertExists('#createmeeting-permissions-container #setpermissions-container input[type="radio"]', 'The \'change permissions\' radio button group is present');
        test.assertExists('#createmeeting-permissions-container .as-selections input', 'The \'share\' input field is present');
        // Select the public permission
        casper.click('#createmeeting-permissions-container #setpermissions-container input[type="radio"][value="public"]', 'Select \'public\' permissions for the meeting');
        // Verify the update button is present
        test.assertExists('#setpermissions-savepermissions', 'The \'Update\' button is present');
        // Share it with the second user that was created for the test
        casper.evaluate(function(user2Id) {
            $('#createmeeting-permissions-container .as-selections input').val(user2Id);
        }, user2Id);
        // Click the input field to trigger the list
        casper.click('#createmeeting-permissions-container .as-selections input');
        casper.waitForSelector('.as-list li', function() {
            // Verify there is at least one item in the autosuggestions
            test.assertExists('.as-list li', 'At least one suggestion for \'' + user2Id + '\' was returned from the server');
            // Click the first suggestion in the list
            casper.click('.as-list li');
            // Click the update button
            casper.click('#setpermissions-savepermissions', 'Update the permission changes');

            // Verify the 'create meeting' button is present
            test.assertExists('#createmeeting-create', 'The \'Create meeting\' button is present');
            // Click the submit button
            casper.click('#createmeeting-create');
            // Wait for a second and verify that the user was redirected to the meeting profile page
            casper.waitForSelector('#meeting-clip-container h1', function() {
                test.assertVisible('#meeting-clip-container', 'Meeting profile is shown after creation of meeting');
                test.assertSelectorHasText('#meeting-clip-container h1', 'Testing tools', 'Title matches \'Testing tools\'');
            });
        });
    };

    /**
     * Verify the form validation by checking the following:
     *     - Try submitting a form without putting in a description
     *     - Try submitting a form without putting in a title
     *     - Try submitting an empty form
     */
    var verifyCreatemeetingValidation = function() {
        casper.waitForSelector('form#createmeeting-form', function() {
            // Test without submitting a meeting description
            // Fill the form
            casper.fill('form#createmeeting-form', {
                'createmeeting-name': 'Valid meeting name',
                'createmeeting-description': ''
            }, false);
            // Click the submit button
            casper.click('#createmeeting-create');
            // Verify that an error label is shown
            test.assertExists('#createmeeting-description-error', 'Successfully validated empty topic');

            // Test submitting without meeting title
            // Fill the form
            casper.fill('form#createmeeting-form', {
                'createmeeting-name': '',
                'createmeeting-description': 'Valid meeting topic'
            }, false);
            // Click the submit button
            casper.click('#createmeeting-create');
            // Verify that an error label is shown
            test.assertExists('#createmeeting-name-error', 'Successfully validated empty title');
        });
    };

    casper.start(configUtil.tenantUI, function() {
        // Create a couple of users to test createmeeting with
        userUtil.createUsers(2, function(user1, user2) {
            // Login with that user
            userUtil.doLogIn(user1.username, user1.password);
            uiUtil.openMe();

            // Open the createmeeting modal
            casper.then(function() {
                casper.echo('# Verify open create meeting modal', 'INFO');
                openCreateMeeting();
            });

            // Create a meeting
            casper.then(function() {
                casper.echo('# Verify create meeting', 'INFO');
                verifyCreatemeeting(user2.username);
            });

            uiUtil.openMe();

            // Verify the meeting form validation
            casper.then(function() {
                casper.echo('# Verify create meeting validation', 'INFO');
                casper.then(openCreateMeeting);
                casper.then(verifyCreatemeetingValidation);
            });

            // Log out at the end of the test
            userUtil.doLogOut();
        });
    });

    casper.run(function() {
        test.done();
    });
});
