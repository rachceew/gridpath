#!/usr/bin/env python
# Copyright 2017 Blue Marble Analytics LLC. All rights reserved.

from __future__ import print_function

from importlib import import_module
import os.path
import pandas as pd
import unittest

from tests.common_functions import create_abstract_model, \
    add_components_and_load_data

TEST_DATA_DIRECTORY = \
    os.path.join(os.path.dirname(__file__), "..", "..", "test_data")

# No prerequisite modules
NAME_OF_MODULE_BEING_TESTED = "temporal.operations.timepoints"

try:
    MODULE_BEING_TESTED = import_module("." + NAME_OF_MODULE_BEING_TESTED,
                                        package="gridpath")
except ImportError:
    print("ERROR! Couldn't import module " + NAME_OF_MODULE_BEING_TESTED +
          " to test.")


class TestTimepoints(unittest.TestCase):
    """

    """
    def test_add_model_components(self):
        """
        Test that there are no errors when adding model components
        :return:
        """
        create_abstract_model(prereq_modules=[],
                              module_to_test=MODULE_BEING_TESTED,
                              test_data_dir=TEST_DATA_DIRECTORY,
                              subproblem="",
                              stage=""
                              )

    def test_load_model_data(self):
        """
        Test that data are loaded with no errors
        :return:
        """
        add_components_and_load_data(prereq_modules=[],
                                     module_to_test=MODULE_BEING_TESTED,
                                     test_data_dir=TEST_DATA_DIRECTORY,
                                     subproblem="",
                                     stage=""
                                     )

    def test_initialized_components(self):
        """
        Create components; check they are initialized with data as expected
        """

        # Load test data
        timepoints_df = \
            pd.read_csv(
                os.path.join(TEST_DATA_DIRECTORY, "inputs", "timepoints.tab"),
                sep="\t",
                usecols=["timepoint", "number_of_hours_in_timepoint",
                         "timepoint_weight", "previous_stage_timepoint_map",
                         "month", "spinup_or_lookahead"]
            )

        m, data = \
            add_components_and_load_data(prereq_modules=[],
                                         module_to_test=MODULE_BEING_TESTED,
                                         test_data_dir=TEST_DATA_DIRECTORY,
                                         subproblem="",
                                         stage="")
        instance = m.create_instance(data)

        expected_tmp = timepoints_df["timepoint"].tolist()
        actual_tmp = [tmp for tmp in instance.TMPS]
        self.assertListEqual(expected_tmp, actual_tmp,
                             msg="TIMEPOINTS set data does not load correctly."
                             )

        # TODO: set index and convert to dict once
        expected_num_hrs_param = \
            timepoints_df.set_index("timepoint").to_dict()[
                "number_of_hours_in_timepoint"
            ]
        actual_num_hrs_param = \
            {tmp: instance.hrs_in_tmp[tmp]
             for tmp in instance.TMPS
             }
        self.assertDictEqual(expected_num_hrs_param, actual_num_hrs_param,
                             msg="Data for param "
                                 "number_of_hours_in_timepoint"
                                 " not loaded correctly")


        # Params: timepoint_weight
        expected_timepoint_weight = \
            timepoints_df.set_index("timepoint").to_dict()["timepoint_weight"]
        actual_timepoint_weight = \
            {tmp: instance.tmp_weight[tmp]
             for tmp in instance.TMPS
             }
        self.assertDictEqual(expected_timepoint_weight, actual_timepoint_weight,
                             msg="Data for param timepoint_weight not loaded "
                                 "correctly")

        # Params: previous_stage_timepoint_map
        expected_previous_stage_timepoint_map = {20200101: 20200101}
        actual_previous_stage_timepoint_map =  \
            {20200101: instance.prev_stage_tmp_map[20200101]}
        # Note: params won't be defined when the value is "." unless there is
        # a default value. We can therefore only test the first timepoint since
        # all other timepoints have "." as input in the test data. We added the
        # defined value for the first timepoint solely for testing purposes.

        self.assertDictEqual(expected_previous_stage_timepoint_map,
                             actual_previous_stage_timepoint_map,
                             msg="Data for param previous_stage_timepoint_map not loaded "
                                 "correctly")

        # Set: MONTHS
        self.assertListEqual([m for m in instance.MONTHS],
                              [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])

        # Params: month
        expected_month = \
            timepoints_df.set_index("timepoint").to_dict()["month"]
        actual_month = \
            {tmp: instance.month[tmp]
             for tmp in instance.TMPS
             }
        self.assertDictEqual(expected_month, actual_month,
                             msg="Data for param month not loaded correctly")

        # There's shouldn't be any linked timepoints in this instance
        # Set: LINKED_TMPS
        self.assertListEqual([m for m in instance.LINKED_TMPS], [])

        # Params: furthest_linked_tmp
        # TODO: not sure how to check that this param has not been initialized

        # Params: spinup_or_lookahead
        expected_spinup_or_lookahead = {tmp: False for tmp in instance.TMPS}
        actual_spinup_or_lookahead = {tmp: instance.spinup_or_lookahead[tmp]
                                      for tmp in instance.TMPS}
        self.assertDictEqual(
            expected_spinup_or_lookahead,
            actual_spinup_or_lookahead,
            msg="Data for param spinup_or_lookahead not loaded correctly"
        )

    def test_linked_tmps(self):
        """
        Create components; check they are initialized with data as expected
        """
        m, data = \
            add_components_and_load_data(
                prereq_modules=[],
                module_to_test=MODULE_BEING_TESTED,
                test_data_dir=os.path.join(TEST_DATA_DIRECTORY, "subproblems"),
                subproblem="202002",
                stage=""
            )
        instance = m.create_instance(data)

        # Set: LINKED_TMPS
        self.assertListEqual(
            [m for m in instance.LINKED_TMPS],
            [-11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0]
        )

        # Params: furthest_linked_tmp
        self.assertEqual(-11, instance.furthest_linked_tmp)


if __name__ == "__main__":
    unittest.main()
