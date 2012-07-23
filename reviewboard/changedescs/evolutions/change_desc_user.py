from django_evolution.mutations import AddField
from django.db import models


MUTATIONS = [
    AddField('ChangeDescription', 'last_modified_user', models.ForeignKey,
             null=True, related_model='auth.User')
]
