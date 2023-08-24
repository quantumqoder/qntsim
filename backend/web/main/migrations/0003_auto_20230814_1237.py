# Generated by Django 3.2.15 on 2023-08-14 12:37

import django.contrib.postgres.fields
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0002_circuit_gates_gatetypes_layergates_layers'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='layergates',
            name='layer_gate_description',
        ),
        migrations.RemoveField(
            model_name='layergates',
            name='layer_name',
        ),
        migrations.AddField(
            model_name='layergates',
            name='gate_id',
            field=models.ForeignKey(default=0, on_delete=django.db.models.deletion.CASCADE, to='main.gates'),
        ),
        migrations.AddField(
            model_name='layergates',
            name='gate_inputs',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(max_length=512), default=list, size=None),
        ),
        migrations.AlterField(
            model_name='gates',
            name='gt_id',
            field=models.ForeignKey(default=0, on_delete=django.db.models.deletion.CASCADE, to='main.gatetypes'),
        ),
    ]
