from django_evolution.mutations import AddField, SQLMutation
from django.db import models

MUTATIONS = [
    AddField('ReviewRequest', 'owner', models.ForeignKey, null=True,
             related_model='auth.User'),
    SQLMutation('populate_review_request_owner', ["""
        UPDATE reviews_reviewrequest
           SET owner_id = submitter_id
    """]),    
    AddField('ReviewRequestDraft', 'owner', models.ForeignKey, null=True,
             related_model='auth.User'),
    SQLMutation('populate_review_request_draft_owner', ["""
        UPDATE reviews_reviewrequestdraft
          SET owner_id = (
            SELECT reviews_reviewrequest.submitter_id
              FROM reviews_reviewrequest
             WHERE reviews_reviewrequest.id = reviews_reviewrequestdraft.id)
    """]),
    AddField('ReviewRequestDraft', 'draft_creator', models.ForeignKey,
             null=True, related_model='auth.User'),
    ChangeField('ReviewRequestDraft', 'review_request', initial=None,
                unique=False),
    AddField('ReviewRequest', 'last_updated_by', models.ForeignKey,
             null=True, related_model='auth.User'),
]
