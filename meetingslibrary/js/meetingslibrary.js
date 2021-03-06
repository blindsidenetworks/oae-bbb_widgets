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

define(['jquery', 'oae.core', 'jquery.history'], function($, oae) {

    return function(uid, showSettings, widgetData) {

        // The widget container
        var $rootel = $('#' + uid);

        // Variable that will be used to keep track of the current infinite scroll instance
        var infinityScroll = false;

        /**
         * Initialize a new infinite scroll container that fetches a meeting library.
         * This will detect when a search is happening and will change the endpoint
         * accordingly.
         */
        var getMeetingsLibrary = function() {
            // Disable the previous infinite scroll
            if (infinityScroll) {
                infinityScroll.kill();
            }

            // Detect whether or not we need to do a search by checking if
            // the History.js state has a query parameter
            var query = History.getState().data.query;
            $('#oae-list-header-search-query', $rootel).val(query);

            // Set up the list actions
            var initialContent = null;
            if ((widgetData.canAdd || widgetData.canManage) && !query) {
                initialContent = oae.api.util.template().render($('#meetingslibrary-list-actions-template', $rootel));
            }

            var url = '/api/meeting/library/' + widgetData.context.id;
            if (query) {
                url = '/api/search/meeting-library/' + widgetData.context.id;
            }

            // Set up the infinite scroll for the meetings library
            infinityScroll = $('.oae-list', $rootel).infiniteScroll(url, {
                'limit': 12,
                'q': query
            }, '#meetingslibrary-template', {
                'initialContent': initialContent,
                'postProcessor': function(data) {
                    // Let the template know whether or not the current list
                    // is a main list or a search list, as different paging
                    // keys need to be provided for each
                    data.query = query;
                    data.displayOptions = {
                        'showCheckbox': true
                    };
                    return data;
                },
                'emptyListProcessor': function() {
                    oae.api.util.template().render($('#meetingslibrary-noresults-template', $rootel), {
                        'query': query
                    }, $('.oae-list', $rootel));
                }
            });
        };

        /**
         * If the current user is an anonymous user, we don't show any actions. If the user
         * is logged in, we render the list of available actions based on whether or not the
         * user can manage this library.
         */
        var setUpListHeader = function() {
            // Determine which list header actions should be available to the user viewing the library
            var listHeaderActions = [];
            if (!oae.data.me.anon) {
                // If the user is logged in, they have the option to share the items
                listHeaderActions.push({
                    'icon': 'fa-share-square-o',
                    'label': oae.api.i18n.translate('__MSG__SHARE__', 'meetingslibrary'),
                    'trigger': 'oae-trigger-share',
                    'data': {'resourceType': 'meeting'}
                });

                if (widgetData.canManage) {
                    // If the user is the manager of the library, they have the option to delete items
                    listHeaderActions.push({
                        'icon': 'fa-trash-o',
                        'label': oae.api.i18n.translate('__MSG__DELETE__', 'meetingslibrary'),
                        'trigger': 'oae-trigger-deleteresources',
                        'data': {'resourceType': 'meeting'}
                    });
                }
            }

            oae.api.util.template().render($('#meetingslibrary-list-header-template', $rootel), {'actions': listHeaderActions}, $('#meetingslibrary-list-header', $rootel));
        };

        /**
         * Add the different event bindings
         */
        var addBinding = function() {

            // Listen to History.js state changes
            $(window).on('statechange', function() {
                // Only re-load the meeting list when the widget is currently visible
                if ($rootel.is(':visible')) {
                    getMeetingsLibrary();
                }
            });

            // Listen to the event that indicates that a piece of content has been deleted
            // so the library can be reloaded
            $(window).on('oae.deleteresources.done', function() {
                // Only re-load the meeting list when the widget is currently visible
                if ($rootel.is(':visible')) {
                    getMeetingsLibrary();
                }
            });
        };

        addBinding();
        setUpListHeader();
        getMeetingsLibrary();

    };
});
