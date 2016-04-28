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

casper.test.begin('Widget - Meeting library', function(test) {

    /**
     * Verify that the share widget can be triggered from within the list options
     */
    var verifyMeetingsLibraryShare = function() {
        // Verify that the share button is disabled by default
        test.assertExists('#meetingslibrary-widget .oae-list-header-actions button.oae-trigger-share:disabled', 'The share button is disabled by default');
        // Select the first meeting item in the list
        casper.click('li.oae-list-actions + li .oae-list-grid-item input[type="checkbox"]');
        // Verify that the share button is now enabled
        test.assertExists('#meetingslibrary-widget .oae-list-header-actions button.oae-trigger-share:not([disabled])', 'The share button is enabled after checking a meeting item');
        // Click the share button
        casper.click('#meetingslibrary-widget .oae-list-header-actions .oae-trigger-share');
        // Verify that the share popover is shown
        casper.waitForSelector('#share-container', function() {
            test.assertExists('#share-container', 'The share popover can be triggered from within the list options');
            // Uncheck the first item from the list
            casper.click('li.oae-list-actions + li .oae-list-grid-item input[type="checkbox"]');
            // Verify that the share button is disabled again
            test.assertExists('#meetingslibrary-widget .oae-list-header-actions button.oae-trigger-share:disabled', 'The share button is disabled again after unchecking all meeting items');
        });
    };

    /**
     * Verify that the deleteresources widget can be triggered from within the list options
     */
    var verifyMeetingsLibraryDelete = function() {
        casper.waitForSelector('li.oae-list-actions + li .oae-list-grid-item input[type="checkbox"]', function() {
            // Verify that delete button is disabled by default
            test.assertExists('#meetingslibrary-widget .oae-list-header-actions button.oae-trigger-deleteresources:disabled', 'The delete button is disabled by default');
            // Select the first meeting item in the list
            casper.click('li.oae-list-actions + li .oae-list-grid-item input[type="checkbox"]');
            // Verify that the delete button is now enabled
            test.assertExists('#meetingslibrary-widget .oae-list-header-actions button.oae-trigger-deleteresources:not([disabled])', 'The delete button is enabled after checking a meeting item');
            // Click the delete button
            casper.click('#meetingslibrary-widget .oae-list-header-actions button.oae-trigger-deleteresources');
            // Verify that the deleteresources widget modal is shown
            casper.waitForSelector('#deleteresources-modal', function() {
                test.assertExists('#deleteresources-modal', 'The deleteresources modal can be triggered from within the list options');
                // Close the modal
                casper.click('#deleteresources-modal .close');
                // Uncheck the first item from the list
                casper.click('li.oae-list-actions + li .oae-list-grid-item input[type="checkbox"]');
                // Verify that the delete button is disabled again
                test.assertExists('#meetingslibrary-widget .oae-list-header-actions button.oae-trigger-deleteresources:disabled', 'The delete button is disabled again after unchecking all meeting items');
            });
        });
    };

    /**
     * Verify that the meeting library can be searched
     */
    var verifyMeetingsLibrarySearch = function(meeting) {
        // Search for something that doesn't match any results
        casper.fill('form.form-search', {
            'search-query': '---'
        }, false);
        casper.click('form.form-search button[type="submit"]');
        // Verify that no results come back and a message is shown
        casper.waitForSelector('.oae-list .alert-info', function() {
            test.assertExists('.oae-list .alert-info', 'No results are returned for non-matching search and a message is shown');
            // Search for 'conversation' which should return 1 result
            casper.fill('form.form-search', {
                'search-query': meeting.displayName
            }, false);
            casper.click('form.form-search button[type="submit"]');
            // Verify one search result comes back
            casper.waitForSelector('#meetingslibrary-widget .oae-list li', function() {
                test.assertExists('#meetingslibrary-widget  .oae-list li', '1 result is returned for \'' + meeting.displayName + '\'');
                test.assertSelectorHasText('#meetingslibrary-widget .oae-list li .oae-tile-metadata a', meeting.displayName, 'The returned meeting has the title \'' + meeting.displayName + '\'');
                // Reset the form
                casper.fill('form.form-search', {
                    'search-query': ''
                }, false);
                casper.click('form.form-search button[type="submit"]');
            });
        });
    };

    /**
     * Verify that the view mode can be changed through the list options
     */
    var verifyMeetingsLibraryViewMode = function() {
        // Toggle the list options
        casper.click('.oae-list-header-toggle');
        // Verify compact list
        casper.click('#meetingslibrary-widget .oae-list-header-actions button[data-type="oae-list-compact"]');
        test.assertExists('.oae-list.oae-list-compact', 'Meeting library can be switched to compact view');
        // Verify details list
        casper.click('#meetingslibrary-widget .oae-list-header-actions button[data-type="oae-list-details"]');
        test.assertExists('.oae-list.oae-list-details', 'Meeting library can be switched to details view');
        // Switch back to grid view
        casper.click('#meetingslibrary-widget .oae-list-header-actions button[data-type="oae-list-grid"]');
        test.assertExists('.oae-list.oae-list-grid', 'Meeting library can be switched to grid view');
    };

    /**
     * Verify if all elements are present in the meeting library
     */
    var verifyMeetingsLibraryElements = function() {
        casper.waitForSelector('#meetingslibrary-widget .oae-list', function() {
            // Verify there is a dummy list item with action buttons
            test.assertExists('#meetingslibrary-widget .oae-list li:first-child', 'Initial dummy list item is present');
            // Verify dummy list item has start meeting button
            test.assertExists('#meetingslibrary-widget .oae-list li:first-child .oae-trigger-createmeeting', 'The first list item has a \'Start meeting\' trigger');
            // Verify create meeting button triggers createmeeting widget
            casper.click('#meetingslibrary-widget .oae-list li:first-child .oae-trigger-createmeeting');
            casper.waitForSelector('#createmeeting-modal', function() {
                test.assertExists('#createmeeting-modal #createmeeting-modal-title', 'The createmeeting widget can be triggered from the dummy list item');
                casper.click('#createmeeting-modal .close');
            });
            // Verify list options are there
            test.assertExists('#meetingslibrary-widget .oae-list-header-actions', 'The list options are present');
            // Verify list options contain a checkbox that selects all
            test.assertExists('#meetingslibrary-widget .oae-list-header-actions input[type="checkbox"]', 'The \'Select all\' checkbox is present in the list options');
            // Verify list options contain a share button
            test.assertExists('#meetingslibrary-widget .oae-list-header-actions .oae-trigger-share', 'The share button is present in the list options');
            // Verify list options contain a delete button
            test.assertExists('#meetingslibrary-widget .oae-list-header-actions .oae-trigger-deleteresources', 'The delete button is present in the list options');
            // Verify list options contain a switch view button
            test.assertExists('#meetingslibrary-widget .oae-list-header-actions button[data-type="oae-list-compact"]', 'The \'Compact\' list view button is present');
            test.assertExists('#meetingslibrary-widget .oae-list-header-actions button[data-type="oae-list-details"]', 'The \'Details\' list view button is present');
            test.assertExists('#meetingslibrary-widget .oae-list-header-actions button[data-type="oae-list-grid"]', 'The \'Grid\' list view button is present');
            // Verify list options contain a search field
            test.assertExists('#meetingslibrary-widget .oae-list-header-search .oae-list-header-search-query', 'The search box is present');
        });
    };

    casper.start(configUtil.tenantUI, function() {
        // Create a couple of users to test with
        userUtil.createUsers(1, function(user1) {
            // Login with that user
            userUtil.doLogIn(user1.username, user1.password);

            meetingUtil.createMeeting(null, null, null, null, null, function(err, meetingProfile) {

                uiUtil.openMyMeetings();

                casper.then(function() {
                    casper.echo('# Verify meeting library elements present', 'INFO');
                    verifyMeetingsLibraryElements();
                });

                casper.then(function() {
                    casper.echo('# Verify meeting library view modes', 'INFO');
                    verifyMeetingsLibraryViewMode();
                });

                casper.then(function() {
                    casper.echo('# Verify meeting library delete', 'INFO');
                    verifyMeetingsLibraryDelete();
                });

                casper.then(function() {
                    casper.echo('# Verify meeting library share', 'INFO');
                    verifyMeetingsLibraryShare();
                });

                casper.then(function() {
                    casper.echo('# Verify meeting library search', 'INFO');
                    casper.wait(configUtil.searchWaitTime, function() {
                        verifyMeetingsLibrarySearch(meetingProfile);
                    });
                });

                // Log out at the end of the test
                userUtil.doLogOut();
            });
        });
    });

    casper.run(function() {
        test.done();
    });
});
