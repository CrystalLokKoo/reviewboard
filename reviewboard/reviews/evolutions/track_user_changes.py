from django_evolution.mutations import AddField, ChangeField
from django.db import models


MUTATIONS = [
    AddField('ReviewRequestDraft', 'draft_creator', models.ForeignKey,
             null=True, related_model='auth.User'),
    ChangeField('ReviewRequestDraft', 'review_request', initial=None,
                unique=False),
    AddField('ReviewRequest', 'last_updated_by', models.ForeignKey,
             null=True, related_model='auth.User'),
]
