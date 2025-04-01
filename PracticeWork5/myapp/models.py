from django.contrib.auth.models import User
from django.db import models
import django_filters

class Category(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Expense(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    date = models.DateField()

    def __str__(self):
        return f"{self.user.username} - {self.amount}"


class ExpenseFilter(django_filters.FilterSet):
    date = django_filters.DateFromToRangeFilter()
    category = django_filters.ModelChoiceFilter(queryset=Category.objects.all())

    class Meta:
        model = Expense
        fields = ['date', 'category']


class GroupExpense(models.Model):
    name = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    users = models.ManyToManyField(User)

    def split_expense(self):
        return self.amount / self.users.count()
